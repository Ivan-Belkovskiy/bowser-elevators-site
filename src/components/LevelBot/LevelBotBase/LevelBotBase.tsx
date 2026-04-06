'use client';

import React, { useEffect, useState, useRef, Dispatch, SetStateAction } from "react";
import "./LevelBotBase.css";
import { CoursebotFloorSlotConfig, LiftJson, SlotData } from "@/types/elevator";
import { LevelBotMode, LevelBotTransitionState, SavePayload } from "../LevelBotModal";
import SlotInfoModal, { EditingSlotData } from "../SlotInfoModal/SlotInfoModal";
import AudioController from "@/core/audio/AudioController";
import { VideoData } from "@/types/data/VideoData";
import WatchListModal from "../WatchListModal/WatchListModal";
import { MyLiftPlayerMode } from "@/components/MyLiftPlayer/MyLiftPlayer";

export default function LevelbotBase({
    slotData,
    coursebotMode,
    transitionState,
    savePayload,
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
    onClearAutosave,
    onOverwriteFragment,
    onDeleteFragment,
    onEditFragment,
    closeModal,
}: {
    slotData?: CoursebotFloorSlotConfig;
    coursebotMode: LevelBotMode;
    transitionState: LevelBotTransitionState;
    savePayload?: SavePayload;
    videoStats?: LiftJson['videoStats'];
    currentVideo?: VideoData;
    watchListOpened?: boolean;
    setWatchListOpened?: Dispatch<SetStateAction<boolean>>;
    onSlotModalOpened?: () => void;
    onSlotModalClosed?: () => void;
    onOpenInMyLiftPlayer?: (slot: SlotData, isAutosave?: boolean, playerMode?: MyLiftPlayerMode) => void;
    onOpenInCoursebotPlayer?: (slot: SlotData, isAutosave?: boolean) => void;
    onSaveFragment?: (title: string, slotIndex: number) => void;
    onAutoSave?: () => void;
    onClearAutosave?: () => void;
    onOverwriteFragment?: (title: string, slotIndex: number) => void;
    onDeleteFragment?: (slotIndex: number) => void;
    onEditFragment?: (data: EditingSlotData, slotIndex: number) => void;
    closeModal?: () => void;
}) {
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

    const videoData = currentVideo;

    const viewsCount = videoStats?.[videoData?.id || ""]?.views || 0;

    const watchData = videoStats?.[videoData?.id || ""];

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

            <div className="coursebot-base__content">
                <WatchListModal opened={watchListOpened} data={watchData} onClose={() => setWatchListOpened?.(false)} />
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
                            <div
                                key={idx}
                                className={`coursebot-base__slot ${bouncingSlotIndex === slotIndex ? "bouncing" : ""}`}
                                onClick={() => openSlot(false, slotIndex, slot)}
                            >
                                <div className={`coursebot-slot__preview ${thumb ? 'with-data' : ''} ${fillingSlotIndex === slotIndex ? "filling" : ""}`}>
                                    {thumb && <img src={thumb} alt={slot.data?.title} />}
                                </div>
                                <span className="coursebot-slot__title">
                                    {slot.data?.title ? (slot.data?.title.length > 10 ? slot.data?.title.slice(0, 11) + '...' : slot.data?.title) : ""}
                                </span>
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
}