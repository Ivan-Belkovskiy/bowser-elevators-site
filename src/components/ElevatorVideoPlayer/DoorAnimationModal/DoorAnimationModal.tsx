'use client';

import { DoorAnimationConfig, DoorKeyframe, LiftJson } from "@/types/elevator";
import "./DoorAnimationModal.css";
import {
    Dispatch,
    SetStateAction,
    useEffect,
    useMemo,
    useRef,
    useState,
    MouseEvent as ReactMouseEvent,
} from "react";
import AudioController from "@/core/audio/AudioController";

export interface DoorAnimationModalProps {
    elevator: LiftJson;
    updateElevatorData: Dispatch<SetStateAction<LiftJson>>;
    onClose: () => void;
}

type AnimKind = "open" | "close";

function applyCurve(t: number, curve: DoorAnimationConfig["curve"]) {
    if (curve === "linear") return t;
    if (curve === "ease-in") return t * t;
    if (curve === "ease-out") return 1 - (1 - t) * (1 - t);
    if (curve === "ease-in-out") {
        return t < 0.5
            ? 2 * t * t
            : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
    return t;
}

export default function DoorAnimationModal({
    elevator,
    updateElevatorData,
    onClose,
}: DoorAnimationModalProps) {
    const doorConfig = elevator.elevator.doorConfig as any;

    const [animKind, setAnimKind] = useState<AnimKind>("open");

    const [animations, setAnimations] = useState<{
        open: DoorAnimationConfig;
        close: DoorAnimationConfig;
    }>(() => {
        const src = doorConfig.animations || {};
        const makeDefault = (reverse = false): DoorAnimationConfig => ({
            durationMs: 1200,
            curve: "ease-in-out",
            keyframes: reverse
                ? [
                    { time: 0, leftDoorX: 1, rightDoorX: 1 },
                    { time: 1, leftDoorX: 0, rightDoorX: 0 },
                ]
                : [
                    { time: 0, leftDoorX: 0, rightDoorX: 0 },
                    { time: 1, leftDoorX: 1, rightDoorX: 1 },
                ],
        });

        const open: DoorAnimationConfig = src.open
            ? {
                durationMs: src.open.durationMs ?? 1200,
                curve: src.open.curve ?? "ease-in-out",
                keyframes: [...src.open.keyframes].sort((a: DoorKeyframe, b: DoorKeyframe) => a.time - b.time),
            }
            : makeDefault(false);

        const close: DoorAnimationConfig = src.close
            ? {
                durationMs: src.close.durationMs ?? 1200,
                curve: src.close.curve ?? "ease-in-out",
                keyframes: [...src.close.keyframes].sort((a: DoorKeyframe, b: DoorKeyframe) => a.time - b.time),
            }
            : makeDefault(true);

        return { open, close };
    });

    const currentAnim = animations[animKind];

    const [currentTime, setCurrentTime] = useState(0); // 0..1
    const [isPlaying, setIsPlaying] = useState(false);
    const timelineRef = useRef<HTMLDivElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const { leftDoorX, rightDoorX } = useMemo(() => {
        const kfs = currentAnim.keyframes;
        if (kfs.length === 0) return { leftDoorX: 0, rightDoorX: 0 };
        if (kfs.length === 1) return { leftDoorX: kfs[0].leftDoorX, rightDoorX: kfs[0].rightDoorX };

        let prev = kfs[0];
        let next = kfs[kfs.length - 1];

        for (let i = 0; i < kfs.length - 1; i++) {
            if (currentTime >= kfs[i].time && currentTime <= kfs[i + 1].time) {
                prev = kfs[i];
                next = kfs[i + 1];
                break;
            }
        }

        if (next.time === prev.time) {
            return { leftDoorX: prev.leftDoorX, rightDoorX: prev.rightDoorX };
        }

        const rawT = (currentTime - prev.time) / (next.time - prev.time);
        const t = applyCurve(rawT, currentAnim.curve);
        const lerp = (a: number, b: number) => a + (b - a) * t;

        return {
            leftDoorX: lerp(prev.leftDoorX, next.leftDoorX),
            rightDoorX: lerp(prev.rightDoorX, next.rightDoorX),
        };
    }, [currentAnim.keyframes, currentAnim.curve, currentTime]);

    useEffect(() => {
        if (!isPlaying) return;

        // alert(elevator)

        const duration = currentAnim.durationMs;
        const start = performance.now();
        const startTime = currentTime * duration;

        const soundUrl =
            animKind === "open"
                ? elevator.elevator.soundEffects.doorOpen
                : elevator.elevator.soundEffects.doorClose;

        // alert(soundUrl);

        if (soundUrl) {
            if (animKind === "open") AudioController.playDoorOpen(soundUrl);
            else AudioController.playDoorClose(soundUrl);
            // const audio = new Audio(soundUrl);
            // audioRef.current = audio;
            // audio.currentTime = (startTime / duration) * (audio.duration || 0);
            // audio.play().catch(() => {});
        }

        let frameId: number;

        const loop = (now: number) => {
            const elapsed = now - start + startTime;
            const t = Math.min(1, elapsed / duration);
            setCurrentTime(t);
            if (t < 1) {
                frameId = requestAnimationFrame(loop);
            } else {
                setIsPlaying(false);
            }
        };

        frameId = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(frameId);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [isPlaying, currentAnim.durationMs, animKind, elevator.elevator.soundEffects]);

    function updateCurrentAnim(updater: (prev: DoorAnimationConfig) => DoorAnimationConfig) {
        setAnimations(prev => ({
            ...prev,
            [animKind]: updater(prev[animKind]),
        }));
    }

    function updateDuration(ms: number) {
        updateCurrentAnim(prev => ({
            ...prev,
            durationMs: Math.max(100, ms),
        }));
    }

    function updateCurve(curve: DoorAnimationConfig["curve"]) {
        updateCurrentAnim(prev => ({
            ...prev,
            curve,
        }));
    }

    function addKeyframeAtCurrentTime() {
        const t = currentTime;
        const newKf: DoorKeyframe = {
            time: t,
            leftDoorX,
            rightDoorX,
        };
        updateCurrentAnim(prev => ({
            ...prev,
            keyframes: [...prev.keyframes, newKf].sort((a, b) => a.time - b.time),
        }));
    }

    function deleteKeyframe(index: number) {
        updateCurrentAnim(prev => ({
            ...prev,
            keyframes: prev.keyframes.filter((_, i) => i !== index),
        }));
    }

    function updateKeyframe(index: number, field: keyof DoorKeyframe, value: number) {
        updateCurrentAnim(prev => {
            const kfs = [...prev.keyframes];
            kfs[index] = { ...kfs[index], [field]: value };
            return { ...prev, keyframes: kfs.sort((a, b) => a.time - b.time) };
        });
    }

    function startDraggingKeyframe(index: number, e: ReactMouseEvent) {
        e.preventDefault();
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();

        function onMove(ev: MouseEvent) {
            const x = ev.clientX - rect.left;
            const t = Math.min(1, Math.max(0, x / rect.width));
            updateKeyframe(index, "time", t);
        }

        function onUp() {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        }

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    }

    function saveAndClose() {
        updateElevatorData(prev => {
            const updated: LiftJson = structuredClone(prev);
            (updated.elevator.doorConfig as any).animations = animations;
            return updated;
        });
        onClose();
    }

    const maxOffset = 62;
    let leftOffsetPx = 0;
    let rightOffsetPx = 0;

    const type = doorConfig.type as "central" | "telescopic" | "single";
    const direction = doorConfig.direction as "left" | "right" | null;

    if (type === "central") {
        leftOffsetPx = -leftDoorX * maxOffset;
        rightOffsetPx = rightDoorX * maxOffset;
    } else if (type === "telescopic") {
        if (direction === "left") {
            leftOffsetPx = -leftDoorX * maxOffset;
            rightOffsetPx = -rightDoorX * maxOffset * 2;
        } else {
            leftOffsetPx = leftDoorX * maxOffset * 2;
            rightOffsetPx = rightDoorX * maxOffset;
        }
    } else if (type === "single") {
        if (direction === "left") {
            leftOffsetPx = -leftDoorX * maxOffset;
            rightOffsetPx = 0;
        } else {
            leftOffsetPx = 0;
            rightOffsetPx = rightDoorX * maxOffset;
        }
    }

    return (
        <div className="door-animation-modal__overlay">
            <div className="door-animation-modal">
                <div className="door-animation-modal__header">
                    <h1 className="door-animation-modal__title">Редактор Анимации Дверей Лифта</h1>
                </div>

                <div className="door-animation-modal__content">
                    <div className="door-animation-modal__left">
                        <div className="door-animation-modal__animation-selector">
                                    <button
                                        className={`door-animation-modal__button anim-type-btn ${animKind === "open" ? "active" : ""}`}
                                        onClick={() => { setAnimKind("open"); setCurrentTime(0); setIsPlaying(false); }}
                                    >
                                        Открытие дверей
                                    </button>
                                    <button
                                        className={`door-animation-modal__button anim-type-btn ${animKind === "close" ? "active" : ""}`}
                                        onClick={() => { setAnimKind("close"); setCurrentTime(0); setIsPlaying(false); }}
                                    >
                                        Закрытие дверей
                                    </button>
                            </div>
                        <div className="door-animation-modal__top">
                            {/* <div className="dam-field animation-selector">
                                    <button
                                        className={`door-animation-modal__button anim-type-btn ${animKind === "open" ? "active" : ""}`}
                                        onClick={() => { setAnimKind("open"); setCurrentTime(0); setIsPlaying(false); }}
                                    >
                                        Открытие дверей
                                    </button>
                                    <button
                                        className={`door-animation-modal__button anim-type-btn ${animKind === "close" ? "active" : ""}`}
                                        onClick={() => { setAnimKind("close"); setCurrentTime(0); setIsPlaying(false); }}
                                    >
                                        Закрытие дверей
                                    </button>
                            </div> */}

                            <div className="door-animation-modal__block">
                                <span>Длительность анимации (мс):</span>
                                <input
                                    type="number"
                                    className="door-animation-modal__input anim-duration-input"
                                    value={currentAnim.durationMs}
                                    onChange={(e) => updateDuration(Number(e.target.value))}
                                />
                            </div>

                            <div className="door-animation-modal__block">
                                <span>Интерполяция:</span>
                                <select
                                    className="door-animation-modal__input anim-duration-input"
                                    value={currentAnim.curve}
                                    onChange={(e) => updateCurve(e.target.value as any)}
                                >
                                    <option value="linear">Linear</option>
                                    <option value="ease-in">Ease-in</option>
                                    <option value="ease-out">Ease-out</option>
                                    <option value="ease-in-out">Ease-in-out</option>
                                </select>
                            </div>

                            <div className="dam-field">
                                <label>Текущее время</label>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={currentTime}
                                    onChange={(e) => setCurrentTime(Number(e.target.value))}
                                />
                                <div>{Math.round(currentTime * currentAnim.durationMs)} мс</div>
                            </div>

                            <div className="dam-controls">
                                <button onClick={() => { setCurrentTime(0); setIsPlaying(true); }}>▶</button>
                                <button onClick={() => setIsPlaying(false)}>⏹</button>
                                <button onClick={() => setCurrentTime(0)}>⏮</button>
                                <button onClick={() => setCurrentTime(1)}>⏭</button>
                                <button onClick={addKeyframeAtCurrentTime}>+ Ключевой кадр</button>
                            </div>
                        </div>

                        <div className="door-animation-modal__bottom">
                            <h2 style={{ color: "#fff", fontSize: 16 }}>Ключевые кадры</h2>
                            <div className="dam-keyframes-list">
                                {currentAnim.keyframes.map((kf, i) => (
                                    <div key={i} className="dam-keyframe-row">
                                        <div>
                                            <label>t</label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={1}
                                                step={0.01}
                                                value={kf.time}
                                                onChange={(e) =>
                                                    updateKeyframe(
                                                        i,
                                                        "time",
                                                        Math.min(1, Math.max(0, Number(e.target.value)))
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label>L</label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={1}
                                                step={0.01}
                                                value={kf.leftDoorX}
                                                onChange={(e) =>
                                                    updateKeyframe(
                                                        i,
                                                        "leftDoorX",
                                                        Math.min(1, Math.max(0, Number(e.target.value)))
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label>R</label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={1}
                                                step={0.01}
                                                value={kf.rightDoorX}
                                                onChange={(e) =>
                                                    updateKeyframe(
                                                        i,
                                                        "rightDoorX",
                                                        Math.min(1, Math.max(0, Number(e.target.value)))
                                                    )
                                                }
                                            />
                                        </div>
                                        <button onClick={() => deleteKeyframe(i)}>✕</button>
                                    </div>
                                ))}
                            </div>

                            <div className="dam-timeline" ref={timelineRef}>
                                {currentAnim.keyframes.map((kf, i) => (
                                    <div
                                        key={i}
                                        className="dam-timeline-keyframe"
                                        style={{ left: `${kf.time * 100}%` }}
                                        onMouseDown={(e) => startDraggingKeyframe(i, e)}
                                        onClick={() => setCurrentTime(kf.time)}
                                    />
                                ))}
                                <div
                                    className="dam-timeline-playhead"
                                    style={{ left: `${currentTime * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="door-animation-modal__right">
                        <div className="door-animation-modal__elevator-cab">
                            <div
                                className="door-animation-modal__elevator-door left-door"
                                style={{ transform: `translateX(${leftOffsetPx}px)` }}
                            />
                            <div
                                className="door-animation-modal__elevator-door right-door"
                                style={{ transform: `translateX(${rightOffsetPx}px)` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="door-animation-modal__footer">
                    <button className="door-animation-modal__button save-button" onClick={saveAndClose}>Сохранить</button>
                    <button className="door-animation-modal__button close-button" onClick={onClose}>Отмена</button>
                </div>
            </div>
        </div>
    );
}



// 'use client';

// import { LiftJson } from "@/types/elevator";
// import "./DoorAnimationModal.css";
// import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

// export interface DoorAnimationModalProps {
//     elevator: LiftJson;
//     updateElevatorData: Dispatch<SetStateAction<LiftJson>>;
//     onClose: () => void;
// }

// interface DoorKeyframe {
//     time: number;       // 0..1
//     leftDoorX: number;  // 0..1
//     rightDoorX: number; // 0..1
// }

// interface DoorAnimationConfig {
//     durationMs: number;
//     keyframes: DoorKeyframe[];
// }

// export default function DoorAnimationModal({
//     elevator,
//     updateElevatorData,
//     onClose
// }: DoorAnimationModalProps) {
//     const doorConfig = elevator.elevator.doorConfig;

//     const [animation, setAnimation] = useState<DoorAnimationConfig>(() => {
//         const a = doorConfig.animation as any;
//         if (a && Array.isArray(a.keyframes) && typeof a.durationMs === "number") {
//             return {
//                 durationMs: a.durationMs,
//                 keyframes: [...a.keyframes].sort((a: DoorKeyframe, b: DoorKeyframe) => a.time - b.time),
//             };
//         }
        
//         return {
//             durationMs: 1200,
//             keyframes: [
//                 { time: 0, leftDoorX: 0, rightDoorX: 0 },
//                 { time: 1, leftDoorX: 1, rightDoorX: 1 },
//             ],
//         };
//     });

//     const [currentTime, setCurrentTime] = useState(0);
//     const [isPlaying, setIsPlaying] = useState(false);

//     const { leftDoorX, rightDoorX } = useMemo(() => {
//         const kfs = animation.keyframes;
//         if (kfs.length === 0) return { leftDoorX: 0, rightDoorX: 0 };
//         if (kfs.length === 1) return { leftDoorX: kfs[0].leftDoorX, rightDoorX: kfs[0].rightDoorX };

//         let prev = kfs[0];
//         let next = kfs[kfs.length - 1];

//         for (let i = 0; i < kfs.length - 1; i++) {
//             if (currentTime >= kfs[i].time && currentTime <= kfs[i + 1].time) {
//                 prev = kfs[i];
//                 next = kfs[i + 1];
//                 break;
//             }
//         }

//         if (next.time === prev.time) {
//             return { leftDoorX: prev.leftDoorX, rightDoorX: prev.rightDoorX };
//         }

//         const t = (currentTime - prev.time) / (next.time - prev.time);
//         const lerp = (a: number, b: number) => a + (b - a) * t;

//         return {
//             leftDoorX: lerp(prev.leftDoorX, next.leftDoorX),
//             rightDoorX: lerp(prev.rightDoorX, next.rightDoorX),
//         };
//     }, [animation.keyframes, currentTime]);

//     useEffect(() => {
//         if (!isPlaying) return;

//         const start = performance.now();
//         const startTime = currentTime * animation.durationMs;

//         let frameId: number;

//         const loop = (now: number) => {
//             const elapsed = now - start + startTime;
//             const t = Math.min(1, elapsed / animation.durationMs);
//             setCurrentTime(t);
//             if (t < 1) {
//                 frameId = requestAnimationFrame(loop);
//             } else {
//                 setIsPlaying(false);
//             }
//         };

//         frameId = requestAnimationFrame(loop);

//         return () => cancelAnimationFrame(frameId);
//     }, [isPlaying, animation.durationMs]);

//     function updateDuration(ms: number) {
//         setAnimation(prev => ({
//             ...prev,
//             durationMs: Math.max(100, ms),
//         }));
//     }

//     function addKeyframeAtCurrentTime() {
//         const t = currentTime;
//         const newKf: DoorKeyframe = {
//             time: t,
//             leftDoorX,
//             rightDoorX,
//         };
//         setAnimation(prev => ({
//             ...prev,
//             keyframes: [...prev.keyframes, newKf].sort((a, b) => a.time - b.time),
//         }));
//     }

//     function deleteKeyframe(index: number) {
//         setAnimation(prev => ({
//             ...prev,
//             keyframes: prev.keyframes.filter((_, i) => i !== index),
//         }));
//     }

//     function updateKeyframe(index: number, field: keyof DoorKeyframe, value: number) {
//         setAnimation(prev => {
//             const kfs = [...prev.keyframes];
//             kfs[index] = { ...kfs[index], [field]: value };
//             return { ...prev, keyframes: kfs.sort((a, b) => a.time - b.time) };
//         });
//     }

//     function saveAndClose() {
//         updateElevatorData(prev => {
//             const updated: LiftJson = structuredClone(prev);
//             (updated.elevator.doorConfig as any).animation = animation;
//             return updated;
//         });
//         onClose();
//     }

//     const maxOffset = 62;
//     const leftOffsetPx = -leftDoorX * maxOffset;
//     const rightOffsetPx = rightDoorX * maxOffset;

//     return (
//         <div className="door-animation-modal__overlay">
//             <div className="door-animation-modal">
//                 <div className="door-animation-modal__header">
//                     <h1 className="door-animation-modal__title">Редактор Анимации Дверей Лифта</h1>
//                 </div>

//                 <div className="door-animation-modal__content">
//                     <div className="door-animation-modal__left">
//                         <div className="door-animation-modal__top">
//                             <div className="dam-field">
//                                 <label>Длительность анимации (мс)</label>
//                                 <input
//                                     type="number"
//                                     value={animation.durationMs}
//                                     onChange={(e) => updateDuration(Number(e.target.value))}
//                                 />
//                             </div>

//                             <div className="dam-field">
//                                 <label>Текущее время</label>
//                                 <input
//                                     type="range"
//                                     min={0}
//                                     max={1}
//                                     step={0.01}
//                                     value={currentTime}
//                                     onChange={(e) => setCurrentTime(Number(e.target.value))}
//                                 />
//                                 <div>{Math.round(currentTime * animation.durationMs)} мс</div>
//                             </div>

//                             <div className="dam-controls">
//                                 <button onClick={() => { setCurrentTime(0); setIsPlaying(true); }}>▶</button>
//                                 <button onClick={() => setIsPlaying(false)}>⏹</button>
//                                 <button onClick={() => setCurrentTime(0)}>⏮</button>
//                                 <button onClick={() => setCurrentTime(1)}>⏭</button>
//                                 <button onClick={addKeyframeAtCurrentTime}>+ Ключевой кадр</button>
//                             </div>
//                         </div>

//                         <div className="door-animation-modal__bottom">
//                             <h2>Ключевые кадры</h2>
//                             <div className="dam-keyframes-list">
//                                 {animation.keyframes.map((kf, i) => (
//                                     <div key={i} className="dam-keyframe-row">
//                                         <div>
//                                             <label>t</label>
//                                             <input
//                                                 type="number"
//                                                 min={0}
//                                                 max={1}
//                                                 step={0.01}
//                                                 value={kf.time}
//                                                 onChange={(e) => updateKeyframe(i, "time", Math.min(1, Math.max(0, Number(e.target.value))))}
//                                             />
//                                         </div>
//                                         <div>
//                                             <label>Left</label>
//                                             <input
//                                                 type="number"
//                                                 min={0}
//                                                 max={1}
//                                                 step={0.01}
//                                                 value={kf.leftDoorX}
//                                                 onChange={(e) => updateKeyframe(i, "leftDoorX", Math.min(1, Math.max(0, Number(e.target.value))))}
//                                             />
//                                         </div>
//                                         <div>
//                                             <label>Right</label>
//                                             <input
//                                                 type="number"
//                                                 min={0}
//                                                 max={1}
//                                                 step={0.01}
//                                                 value={kf.rightDoorX}
//                                                 onChange={(e) => updateKeyframe(i, "rightDoorX", Math.min(1, Math.max(0, Number(e.target.value))))}
//                                             />
//                                         </div>
//                                         <button onClick={() => deleteKeyframe(i)}>✕</button>
//                                     </div>
//                                 ))}
//                             </div>

//                             <div className="dam-timeline">
//                                 {animation.keyframes.map((kf, i) => (
//                                     <div
//                                         key={i}
//                                         className="dam-timeline-keyframe"
//                                         style={{ left: `${kf.time * 100}%` }}
//                                         onClick={() => setCurrentTime(kf.time)}
//                                     />
//                                 ))}
//                                 <div className="dam-timeline-playhead" style={{ left: `${currentTime * 100}%` }} />
//                             </div>
//                         </div>
//                     </div>

//                     <div className="door-animation-modal__right">
//                         <div className="door-animation-modal__elevator-cab">
//                             <div
//                                 className="door-animation-modal__elevator-door left-door"
//                                 style={{ transform: `translateX(${leftOffsetPx}px)` }}
//                             />
//                             <div
//                                 className="door-animation-modal__elevator-door right-door"
//                                 style={{ transform: `translateX(${rightOffsetPx}px)` }}
//                             />
//                         </div>
//                     </div>
//                 </div>

                // <div className="door-animation-modal__footer">
                //     <button className="door-animation-modal__button save-button" onClick={saveAndClose}>Сохранить</button>
                //     <button className="door-animation-modal__button close-button" onClick={onClose}>Отмена</button>
                // </div>
//             </div>
//         </div>
//     );
// }
