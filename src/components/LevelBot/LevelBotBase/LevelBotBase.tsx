'use client';

import React, { useEffect, useState, useRef, Dispatch, SetStateAction, MouseEvent } from "react";
import "./LevelBotBase.css";
import { CoursebotFloorSlotConfig, getVideoStats, LiftJson, SlotData } from "@/types/elevator";
import { LevelBotMode, LevelBotTransitionState, SavePayload } from "../LevelBotModal";
import SlotInfoModal, { EditingSlotData } from "../SlotInfoModal/SlotInfoModal";
import AudioController from "@/core/audio/AudioController";
import { getVideoData, VideoData } from "@/types/data/VideoData";
import WatchListModal from "../WatchListModal/WatchListModal";
import { MyLiftPlayerMode, PlayerState } from "@/components/MyLiftPlayer/MyLiftPlayer";

interface ClickedSlotInfo {
    idx: number;
    data?: SlotData;
    position: {
        x: number;
        y: number;
        mouseX: number;
        mouseY: number;
    }
}

export default function LevelbotBase({
    floorId,
    slotData,
    coursebotMode,
    transitionState,
    savePayload,
    playerState,
    videoStats,
    currentVideo,
    watchListOpened,
    setWatchListOpened,
    onSlotModalOpened,
    onSlotModalClosed,
    onOpenInMyLiftPlayer,
    onOpenInCoursebotPlayer,
    onSaveFragment,
    onAutoSave,
    onSlotReplace,
    onClearAutosave,
    onOverwriteFragment,
    onDeleteFragment,
    onEditFragment,
    closeModal,
}: {
    elevatorId?: string;
    floorId?: string;
    slotData?: CoursebotFloorSlotConfig;
    coursebotMode: LevelBotMode;
    transitionState: LevelBotTransitionState;
    savePayload?: SavePayload;
    videoStats?: LiftJson['videoStats'];
    currentVideo?: VideoData;
    watchListOpened?: boolean;
    playerState?: PlayerState;
    setWatchListOpened?: Dispatch<SetStateAction<boolean>>;
    onSlotModalOpened?: () => void;
    onSlotModalClosed?: () => void;
    onOpenInMyLiftPlayer?: (slot: SlotData, isAutosave?: boolean, playerMode?: MyLiftPlayerMode) => void;
    onOpenInCoursebotPlayer?: (slot: SlotData, isAutosave?: boolean) => void;
    onSaveFragment?: (title: string, slotIndex: number) => void;
    onAutoSave?: () => void;
    onSlotReplace?: (idx1: number, idx2: number) => void;
    onClearAutosave?: () => void;
    onOverwriteFragment?: (title: string, slotIndex: number) => void;
    onDeleteFragment?: (slotIndex: number) => void;
    onEditFragment?: (data: EditingSlotData, slotIndex: number) => void;
    closeModal?: () => void;
}) {

    const [tempSlotData, setTempSlotData] = useState<CoursebotFloorSlotConfig | null>(null);

    const [selectedSlot, setSelectedSlot] = useState<{
        isAutosave: boolean;
        index: number;
        data?: SlotData;
    } | null>(null);

    const [bouncingSlotIndex, setBouncingSlotIndex] = useState<number | null>(null);
    const [fillingSlotIndex, setFillingSlotIndex] = useState<number | null>(null);
    const [savingIndex, setSavingIndex] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveComplete, setSaveComplete] = useState(false);

    const timers = useRef<NodeJS.Timeout[]>([]);
    const addTimer = (tm: NodeJS.Timeout) => timers.current.push(tm);

    const isClosed = transitionState === "closing" || transitionState === "closed";

    const openSlot = (isAutosave: boolean, index: number, data?: SlotData) => {
        if (coursebotMode === "autosave" || isSaving) return;
        AudioController.playCoursebotSound("slot_click", "/audio/sound/coursebot/coursebot-slot-click-02.wav");
        if (coursebotMode === "save" && isAutosave) return;
        if (coursebotMode === "load" && !data) return;

        onSlotModalOpened?.();
        setSelectedSlot({ isAutosave, index, data });
    };

    const closeSlot = () => {
        setSelectedSlot(null);
        onSlotModalClosed?.();
    };

    const triggerSlotAnimation = (slotIndex: number) => {
        setIsSaving(true);
        setSavingIndex(slotIndex);

        addTimer(setTimeout(() => {
            AudioController.playCoursebotSound("save_data", "/audio/sound/coursebot/coursebot-save-data.wav");
            setFillingSlotIndex(slotIndex);

            addTimer(setTimeout(() => {
                setFillingSlotIndex(null);
                setBouncingSlotIndex(slotIndex);

                addTimer(setTimeout(() => {
                    setBouncingSlotIndex(null);
                    addTimer(setTimeout(() => {
                        setIsSaving(false);
                        setSaveComplete(false);
                        setSavingIndex(null);
                        onAutoSave?.();
                        closeModal?.();
                    }, 1200));
                }, 800));
            }, 1300));
        }, 2000));
    };

    useEffect(() => {
        if (coursebotMode === 'autosave') {
            const tm = setTimeout(() => {
                onAutoSave?.();
                triggerSlotAnimation(0);
            }, 300);
            return () => clearTimeout(tm);
        }
    }, [coursebotMode]);

    useEffect(() => {
        return () => timers.current.forEach(clearTimeout);
    }, []);

    const getSlotImage = (idx: number, currentDataUrl?: string) => {
        if ((isSaving || saveComplete) && savingIndex === idx) {
            return savePayload?.thumbnailUrl || currentDataUrl;
        }
        // alert();
        return currentDataUrl ? `${currentDataUrl}?t=${new Date().getTime()}` : undefined;
    };

    // const [isWatchListOpened, setWatchListOpened] = useState(false);

    const contentRef = useRef<HTMLDivElement | null>(null);

    const [clickedSlot, setClickedSlot] = useState<ClickedSlotInfo | null>(null);
    const [movingSlot, setMovingSlot] = useState<ClickedSlotInfo | null>(null);
    const clickedSlotRef = useRef<ClickedSlotInfo | null>(null);

    const calculateSlotIdxByPosition = (slot: { x: number; y: number }) => {
        const SLOT_WIDTH = 200;
        const SLOT_HEIGHT = 167;
        const COLUMNS = 4;

        const col = (Math.round(slot.x / SLOT_WIDTH) + 1);
        const row = Math.round(slot.y / SLOT_HEIGHT);

        return (col + (row * COLUMNS));
    };

    const onSlotMoveStart = (e: MouseEvent<HTMLDivElement>, slotIdx: number, data?: SlotData) => {
        if (!e || !slotIdx) return;

        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const container = contentRef.current;



        if (!container) return;

        const containerRect = container.getBoundingClientRect();

        setClickedSlot({
            idx: slotIdx,
            data: data,
            position: {
                x: rect.left - containerRect.left + container.scrollLeft,
                y: rect.top - containerRect.top + container.scrollTop,
                mouseX: e.clientX,
                mouseY: e.clientY
            }
        });
    };

    const onSlotMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!e || !clickedSlot) return;
        if (!movingSlot) return;

        const deltaX = e.clientX - clickedSlot.position.mouseX;
        const deltaY = e.clientY - clickedSlot.position.mouseY;

        setMovingSlot({
            ...clickedSlot,
            position: {
                ...clickedSlot.position,
                x: clickedSlot.position.x + deltaX,
                y: clickedSlot.position.y + deltaY,
            }
        });
    };


    // const replaceSlots = async (floorId: string, idx1: number, idx2: number) => {
    //     try {
    //         const formData = new FormData();
    //         formData.append("coursebot_slot_replace", `${floorId}-${idx1}-${idx2}`);

    //         // alert(`${floorId}-${idx1}-${idx2}`);
    //         const res = await fetch(`/api/elevators/${elevatorId}`, {
    //             method: "PUT",
    //             body: formData,
    //         });

    //         const data: { success: boolean; lift: LiftJson } = await res.json();

    //         if (data.success) {
    //             // alert('successfully replaced slots!');
    //         }

    //     } catch (error) {

    //     }
    // }

    const onSlotMoveEnd = (e: MouseEvent<HTMLDivElement>) => {
        if (!e || !clickedSlot) return;
        if (!movingSlot) openSlot(false, clickedSlot.idx, clickedSlot.data);

        if (!floorId) return;
        const contentRect = contentRef.current?.getBoundingClientRect();

        if (contentRect && movingSlot) {
            const newIdx = calculateSlotIdxByPosition({
                x: movingSlot.position.x,
                y: movingSlot.position.y
            }/*, {
                width: contentRect.width,
                height: contentRect.height
            } */);

            onSlotReplace?.((movingSlot.idx - 1), (newIdx - 2));
            AudioController.playCoursebotSound("tab_switch_drop");


            // alert(`new: ${newIdx - 2}\nold: ${movingSlot.idx - 1}`);
        }

        setMovingSlot(null);
        setClickedSlot(null);
    }

    const timerRef = useRef(0);


    useEffect(() => {
        let frameId: number;
        // let timer = 0;

        clickedSlotRef.current = clickedSlot;
        // alert(JSON.stringify(clickedSlot));

        const timeHandler = () => {
            if (!clickedSlotRef.current) return;
            timerRef.current++;
            // alert(timerRef.current);
            // timer++;

            if (timerRef.current > 50) {
                setMovingSlot(clickedSlot);
                timerRef.current = 0;
                AudioController.playCoursebotSound("slot_start_move");
                // alert('START MOVE!');
            } else requestAnimationFrame(timeHandler);
        }

        frameId = requestAnimationFrame(timeHandler);

        return () => cancelAnimationFrame(frameId);

    }, [clickedSlot]);

    const [currentVideoNumber, setCurrentVideoNumber] = useState(0);

    const videoData = getVideoData(currentVideo, currentVideoNumber);

    const vStats = getVideoStats(videoStats?.[videoData?.id || ""], currentVideoNumber);

    const viewsCount = vStats?.views || 0;

    const watchData = vStats;

    return (
        <div className="coursebot-base" data-mode={coursebotMode}>
            {(videoData && videoStats && coursebotMode === 'default') && <div className={`coursebot-base__stats-block ${(transitionState === 'idle' && !selectedSlot && !watchListOpened) ? `active` : ``}`}>
                <span>Просмотрено: {viewsCount + `${[2, 3, 4].includes(viewsCount) ? " раза" : " раз"}`}</span>
                <button
                    className="coursebot-base__button view-history-button"
                    onClick={() => {
                        AudioController.playCoursebotSound("watchlist_button");
                        setWatchListOpened?.(true);
                    }}>⇑</button>
            </div>}
            <div className="coursebot-base__top">
                <div className="coursebot-base__buttons">
                    <button className="coursebot-base__button tab-button active-tab">Сохраненные фрагменты</button>
                    <button className="coursebot-base__button tab-button" disabled>MyLift AI Editor</button>
                </div>
                <div className="coursebot-base__buttons-decoration"></div>
            </div>

            <div className={`coursebot-base__transition ${isClosed ? "active" : ""}`}></div>

            <SlotInfoModal
                mode={coursebotMode}
                playerState={playerState}
                slotData={selectedSlot}
                savePayload={savePayload}
                videoStats={videoStats?.[videoData?.id || ""]}
                onClose={closeSlot}
                onOpenInMyLiftPlayer={(mode) => selectedSlot?.data && onOpenInMyLiftPlayer?.(selectedSlot.data, selectedSlot.isAutosave, mode)}
                onOpenInCoursebotPlayer={() => selectedSlot?.data && onOpenInCoursebotPlayer?.(selectedSlot.data, selectedSlot.isAutosave)}
                onSave={(title) => {
                    if (selectedSlot) {
                        onSaveFragment?.(title, selectedSlot.index);
                        triggerSlotAnimation(selectedSlot.index);
                        closeSlot();
                    }
                }}
                onOverwrite={(title) => {
                    if (selectedSlot) {
                        onOverwriteFragment?.(title, selectedSlot.index);
                        triggerSlotAnimation(selectedSlot.index);
                        closeSlot();
                    }
                }}
                onEdit={(data) => {
                    if (selectedSlot) {
                        onEditFragment?.({ ...data }, selectedSlot.index);
                        closeSlot();
                    }
                }}
                onDelete={() => { closeSlot(); selectedSlot && onDeleteFragment?.(selectedSlot.index); }}
                onClearAutosave={() => { closeSlot(); onClearAutosave?.(); }}
            />
 
            <WatchListModal opened={watchListOpened} data={watchData} onClose={() => setWatchListOpened?.(false)} />
            <div
                className={`coursebot-base__content ${movingSlot ? `slot-move-mode` : ``}`}
                ref={contentRef}
                onMouseMove={(e) => onSlotMove(e)}
                onMouseUp={(e) => onSlotMoveEnd(e)}
            >
                {/* <WatchListModal opened={watchListOpened} data={watchData} onClose={() => setWatchListOpened?.(false)} /> */}
                <div
                    className={`coursebot-base__slot autosave 
                        ${coursebotMode === "save" ? "locked" : ""}
                        ${bouncingSlotIndex === 0 ? "bouncing" : ""}`}
                    onClick={() => openSlot(true, 0, slotData?.autosave)}
                >
                    <div className={`coursebot-slot__preview 
                        ${(slotData?.autosave?.isAutosave) && (getSlotImage(0, slotData.autosave.data?.main?.thumbnailUrl)) ? 'with-data' : ''} 
                        ${fillingSlotIndex === 0 ? "filling" : ""}`}>
                        {(slotData?.autosave?.isAutosave) && getSlotImage(0, slotData.autosave.data?.main?.thumbnailUrl) && (
                            <img src={getSlotImage(0, slotData.autosave.data.main.thumbnailUrl)} alt="autosave" />
                        )}
                    </div>
                    <span className="coursebot-slot__title">Автосохранение</span>
                </div>

                {slotData?.fragments.map((slot, idx) => {
                    const slotIndex = idx + 1;
                    if (!slot.isAutosave) {
                        const thumb = getSlotImage(slotIndex, slot.data?.thumbnailUrl);

                        return (
                            <>
                                {(movingSlot?.idx === slotIndex) && <div className="coursebot-base__slot empty-slot"></div>}
                                <div
                                    key={idx}
                                    className={`coursebot-base__slot ${bouncingSlotIndex === slotIndex ? "bouncing" : ""} ${movingSlot?.idx === slotIndex ? `moving` : ``}`}
                                    style={(movingSlot?.idx === slotIndex) ? {
                                        position: 'absolute',
                                        left: `${movingSlot.position?.x}px`,
                                        top: `${movingSlot.position?.y}px`,
                                        zIndex: 50,
                                    } : {}}
                                    onMouseDown={(e) => onSlotMoveStart(e, slotIndex, slot)} // Для перемещения слотов
                                // onMouseMove={(e) => onSlotMove(e, slotIndex)}
                                // onMouseUp={(e) => onSlotMoveEnd(e, slotIndex)}
                                // onClick={() => (movingSlot?.idx !== slotIndex) && openSlot(false, slotIndex, slot)}
                                >
                                    <div className={`coursebot-slot__preview ${thumb ? 'with-data' : ''} ${fillingSlotIndex === slotIndex ? "filling" : ""}`}>
                                        {thumb && <img src={thumb} alt={slot.data?.title} />}
                                    </div>
                                    <span className="coursebot-slot__title">
                                        {slot.data?.title ? (slot.data?.title.length > 10 ? slot.data?.title.slice(0, 11) + '...' : slot.data?.title) : ""}
                                    </span>
                                </div>
                            </>
                        );
                    }
                })}
            </div>
        </div>
    );
}