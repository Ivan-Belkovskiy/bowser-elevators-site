'use client';

import { LiftJson } from "@/types/elevator";
import "./LiftMotionModal.css";
import { useState, useEffect, useRef } from "react";

export default function LiftMotionModal({
    elevator,
    updateElevatorData,
    onClose
}: {
    elevator: LiftJson;
    updateElevatorData: any;
    onClose: () => void;
}) {
    const motion = elevator.elevator.motion;

    const [mode, setMode] = useState<"up" | "down">("up");
    const [params, setParams] = useState(() => motion[mode]);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const cabRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setParams(motion[mode]);
    }, [mode]);

    function updateField(field: string, value: number | string) {
        setParams(prev => ({ ...prev, [field]: value }));
    }

    function save() {
        updateElevatorData((prev: LiftJson) => {
            const updated = structuredClone(prev);
            updated.elevator.motion[mode] = params;
            return updated;
        });
        onClose();
    }

    function play() {
        let startAudio: null | HTMLAudioElement | true = null;
        let moveAudio: null | HTMLAudioElement | true = null;
        let endAudio: null | HTMLAudioElement | true = null;

        setIsPlaying(true);
        setCurrentTime(0);

        const total =
            params.preDelayMs +
            params.accelMs +
            params.speedMsPerFloor +
            params.decelMs +
            params.postDelayMs;

        const start = performance.now();

        let frameId: number;

        const loop = (now: number) => {
            const t = now - start;
            const progress = Math.min(1, t / total);
            const ms = progress * total;

            // 1. Старт движения
            if (!startAudio) {
                const url = elevator.elevator.soundEffects.movement.start;
                if (url) {
                    startAudio = new Audio(url)
                    startAudio.play().catch(() => { });
                } else {
                    startAudio = true;
                }
            }

            // 2. Выход на постоянную скорость
            if (!moveAudio && ms >= params.preDelayMs + params.accelMs) {
                moveAudio = true;
                const url = elevator.elevator.soundEffects.movement.move;
                if (url) {
                    moveAudio = new Audio(url)
                    moveAudio.play().then(() => {
                        if (startAudio instanceof HTMLAudioElement) startAudio.pause();
                    }).catch(() => { });
                } else {
                    moveAudio = true;
                }
            }

            // 3. Начало торможения
            if (!endAudio && ms >= params.preDelayMs + params.accelMs + params.speedMsPerFloor) {
                endAudio = true;
                const url = elevator.elevator.soundEffects.movement.end;
                if (url) {
                    endAudio = new Audio(url)
                    endAudio.play().then(() => {
                        if (moveAudio instanceof HTMLAudioElement) moveAudio.pause();
                    }).catch(() => { });
                } else {
                    endAudio = true;
                }
            }

            setCurrentTime(progress);

            const cab = cabRef.current;
            if (cab) {
                const height = 120; // px per floor
                const pos = computePosition(progress, params, height);
                cab.style.transform = `translateY(${-pos}px)`;
            }

            if (progress < 1) {
                frameId = requestAnimationFrame(loop);
            } else {
                setIsPlaying(false);
            }
        };

        frameId = requestAnimationFrame(loop);

        return () => cancelAnimationFrame(frameId);
    }

    function computePosition(t: number, p: any, height: number) {
        // Для удобства вынесем тайминги в отдельные переменные
        const t_pre = p.preDelayMs;
        const t_acc = p.accelMs;
        const t_con = p.speedMsPerFloor;
        const t_dec = p.decelMs;
        const t_post = p.postDelayMs;

        const totalMs = t_pre + t_acc + t_con + t_dec + t_post;
        const ms = t * totalMs;

        // 1. Задержка перед стартом
        if (ms <= t_pre) return 0;

        // Эффективное время для расчета максимальной скорости (площадь под трапецией)
        const effectiveTime = 0.5 * t_acc + t_con + 0.5 * t_dec;

        // Защита от деления на ноль, если все активные тайминги равны 0
        if (effectiveTime === 0) return height;

        // Максимальная скорость кабины (пикселей в миллисекунду)
        const vMax = height / effectiveTime;

        // Дистанции, которые кабина гарантированно пройдет к концу каждой из фаз
        const d_acc = 0.5 * vMax * t_acc;
        const d_con = d_acc + vMax * t_con;

        const ms_active = ms - t_pre;

        // 2. Фаза разгона (равноускоренное движение: S = a*t^2 / 2)
        if (ms_active <= t_acc) {
            const accel = vMax / t_acc;
            return 0.5 * accel * (ms_active * ms_active);
        }

        // 3. Фаза равномерного движения (S = S_нач + V*t)
        const ms_con_active = ms_active - t_acc;
        if (ms_con_active <= t_con) {
            return d_acc + vMax * ms_con_active;
        }

        // 4. Фаза торможения (равнозамедленное движение: S = S_нач + V*t - a*t^2 / 2)
        const ms_dec_active = ms_con_active - t_con;
        if (ms_dec_active <= t_dec) {
            const decel = vMax / t_dec;
            return d_con + (vMax * ms_dec_active) - (0.5 * decel * (ms_dec_active * ms_dec_active));
        }

        // 5. Задержка после остановки (кабина точно на этаже)
        return height;
    }



    return (
        <div className="lift-motion-modal__overlay">
            <div className="lift-motion-modal">
                <div className="lift-motion-modal__header">
                    <h1>Редактор движения лифта</h1>
                </div>

                <div className="lift-motion-modal__content">
                    <div className="lift-motion-modal__left">
                        <div className="motion-field">
                            <label>Направление движения:</label>
                            <div className="motion-mode">
                                <button onClick={() => setMode("up")} className={mode === "up" ? "active" : ""}>Вверх</button>
                                <button onClick={() => setMode("down")} className={mode === "down" ? "active" : ""}>Вниз</button>
                            </div>
                        </div>

                        <div className="motion-field">
                            <label>Задержка перед стартом (мс):</label>
                            <input type="number" value={params.preDelayMs} onChange={(e) => updateField("preDelayMs", Number(e.target.value))} />
                        </div>

                        <div className="motion-field">
                            <label>Разгон (мс):</label>
                            <input type="number" value={params.accelMs} onChange={(e) => updateField("accelMs", Number(e.target.value))} />
                        </div>

                        <div className="motion-field">
                            <label>Скорость (мс на этаж):</label>
                            <input type="number" value={params.speedMsPerFloor} onChange={(e) => updateField("speedMsPerFloor", Number(e.target.value))} />
                        </div>

                        <div className="motion-field">
                            <label>Торможение (мс):</label>
                            <input type="number" value={params.decelMs} onChange={(e) => updateField("decelMs", Number(e.target.value))} />
                        </div>

                        <div className="motion-field">
                            <label>Задержка перед открытием дверей (мс):</label>
                            <input type="number" value={params.postDelayMs} onChange={(e) => updateField("postDelayMs", Number(e.target.value))} />
                        </div>

                        <div className="motion-field">
                            <label>Интерполяция:</label>
                            <select value={params.curve} onChange={(e) => updateField("curve", e.target.value)}>
                                <option value="linear">Linear</option>
                                <option value="ease-in">Ease-in</option>
                                <option value="ease-out">Ease-out</option>
                                <option value="ease-in-out">Ease-in-out</option>
                            </select>
                        </div>

                        <div className="motion-controls">
                            <button onClick={play}>▶ Проверить</button>
                            <button onClick={() => setIsPlaying(false)}>⏹ Остановить</button>
                        </div>
                    </div>

                    {/* <div className="lift-motion-modal__right">
                        <div className="motion-test-area">
                            <div className="motion-floor">3</div>
                            <div className="motion-floor">2</div>
                            <div className="motion-floor">1</div>

                            <div className="motion-cab" ref={cabRef}></div>
                        </div>
                    </div> */}
                </div>

                <div className="lift-motion-modal__footer">
                    <button onClick={save}>Сохранить</button>
                    <button onClick={onClose}>Отмена</button>
                </div>
            </div>
        </div>
    );
}
