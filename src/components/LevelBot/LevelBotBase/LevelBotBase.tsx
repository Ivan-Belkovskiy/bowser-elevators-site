'use client';

import React, { useEffect, useState, useRef } from "react";
import "./LevelBotBase.css";
import { CoursebotFloorSlotConfig, SlotData } from "@/types/elevator";
import { LevelBotMode, LevelBotTransitionState, SavePayload } from "../LevelBotModal";
import SlotInfoModal, { EditingSlotData } from "../SlotInfoModal/SlotInfoModal";
import AudioController from "@/core/audio/AudioController";

export default function LevelbotBase({
    slotData,
    coursebotMode,
    transitionState,
    savePayload,
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
    onSlotModalOpened?: () => void;
    onSlotModalClosed?: () => void;
    onOpenInMyLiftPlayer?: (slot: SlotData) => void;
    onOpenInCoursebotPlayer?: (slot: SlotData) => void;
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
    const [savingIndex, setSavingIndex] = useState<number | null>(null); // КТО именно сохраняется
    const [isSaving, setIsSaving] = useState(false);
    const [saveComplete, setSaveComplete] = useState(false);

    // Используем реф для очистки таймеров
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
        setSavingIndex(slotIndex); // Фиксируем индекс сохраняемого слота
        
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
                        setSaveComplete(true);
                        setSavingIndex(null);
                        closeModal?.();
                    }, 1200));
                }, 800));
            }, 1300));
        }, 1000));
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

    // Очистка при размонтировании
    useEffect(() => {
        return () => timers.current.forEach(clearTimeout);
    }, []);

    // Универсальная функция для получения URL картинки в слоте
    const getSlotImage = (idx: number, currentDataUrl?: string) => {
        // Если этот конкретный слот сейчас анимирует сохранение
        if ((isSaving || saveComplete) && savingIndex === idx) {
            return savePayload?.thumbnailUrl || currentDataUrl;
        }
        return currentDataUrl;
    };

    return (
        <div className="coursebot-base" data-mode={coursebotMode}>
            {/* ... Шапка и декорации остаются прежними ... */}
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
                onClose={closeSlot}
                onOpenInMyLiftPlayer={() => selectedSlot?.data && onOpenInMyLiftPlayer?.(selectedSlot.data)}
                onOpenInCoursebotPlayer={() => selectedSlot?.data && onOpenInCoursebotPlayer?.(selectedSlot.data)}
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
                        onEditFragment?.({...data}, selectedSlot.index);
                        closeSlot();
                    }
                }}
                onDelete={() => { closeSlot(); selectedSlot && onDeleteFragment?.(selectedSlot.index); }}
                onClearAutosave={() => { closeSlot(); onClearAutosave?.(); }}
            />

            <div className="coursebot-base__content">
                {/* АВТОСОХРАНЕНИЕ (Индекс 0) */}
                <div
                    className={`coursebot-base__slot autosave 
                        ${coursebotMode === "save" ? "locked" : ""}
                        ${bouncingSlotIndex === 0 ? "bouncing" : ""}`}
                    onClick={() => openSlot(true, 0, slotData?.autosave)}
                >
                    <div className={`coursebot-slot__preview 
                        ${(getSlotImage(0, slotData?.autosave?.thumbnailUrl)) ? 'with-data' : ''} 
                        ${fillingSlotIndex === 0 ? "filling" : ""}`}>
                        {getSlotImage(0, slotData?.autosave?.thumbnailUrl) && (
                            <img src={getSlotImage(0, slotData?.autosave?.thumbnailUrl)} alt="autosave" />
                        )}
                    </div>
                    <span className="coursebot-slot__title">Автосохранение</span>
                </div>

                {/* ФРАГМЕНТЫ (Индексы 1+) */}
                {slotData?.fragments.map((slot, idx) => {
                    const slotIndex = idx + 1;
                    const thumb = getSlotImage(slotIndex, slot.thumbnailUrl);

                    return (
                        <div
                            key={idx}
                            className={`coursebot-base__slot ${bouncingSlotIndex === slotIndex ? "bouncing" : ""}`}
                            onClick={() => openSlot(false, slotIndex, slot)}
                        >
                            <div className={`coursebot-slot__preview ${thumb ? 'with-data' : ''} ${fillingSlotIndex === slotIndex ? "filling" : ""}`}>
                                {thumb && <img src={thumb} alt={slot.title} />}
                            </div>
                            <span className="coursebot-slot__title">
                                {slot.title ? (slot.title.length > 10 ? slot.title.slice(0, 11) + '...' : slot.title) : ""}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}