'use client';

import React, { useEffect, useState } from "react";
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
    const [isSaving, setIsSaving] = useState(false);

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
        setTimeout(() => {
            AudioController.playCoursebotSound("save_data", "/audio/sound/coursebot/coursebot-save-data.wav");
            setFillingSlotIndex(slotIndex);

            setTimeout(() => {
                setFillingSlotIndex(null);
                setBouncingSlotIndex(slotIndex);

                setTimeout(() => {
                    setBouncingSlotIndex(null);
                    setTimeout(() => {
                        setIsSaving(false);
                        closeModal?.();
                    }, 1200);
                }, 800);
            }, 1300);
        }, 550);
        // setBouncingSlotIndex(slotIndex);

        // setTimeout(() => {
        //     setBouncingSlotIndex(null);
        // }, 1200);
    };

    const formatSlotTitle = (title: string = "") => {
        let result = title;
        if (title.length > 10) result = title.slice(0, 11) + '...';
        return result;
    }

    useEffect(() => {
        if (coursebotMode === 'autosave') {
            setTimeout(() => {
                onAutoSave?.();
                triggerSlotAnimation(0);
            }, 300);
        }
    }, [coursebotMode]);

    return (
        <div className="coursebot-base" data-mode={coursebotMode}>
            <div className="coursebot-base__top">
                <div className="coursebot-base__buttons">
                    <button className="coursebot-base__button tab-button active-tab">
                        Сохраненные фрагменты
                    </button>
                    <button className="coursebot-base__button tab-button" disabled>
                        MyLift AI Editor
                    </button>
                </div>
                <div className="coursebot-base__buttons-decoration"></div>
            </div>

            <div className={`coursebot-base__transition ${isClosed ? "active" : ""}`}></div>

            <SlotInfoModal
                mode={coursebotMode}
                slotData={selectedSlot}
                savePayload={savePayload}
                onClose={closeSlot}

                onOpenInMyLiftPlayer={() => {
                    if (selectedSlot?.data) onOpenInMyLiftPlayer?.(selectedSlot.data);
                }}

                onOpenInCoursebotPlayer={() => {
                    if (selectedSlot?.data) onOpenInCoursebotPlayer?.(selectedSlot.data);
                }}

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
                        onEditFragment?.({
                            ...data
                        }, selectedSlot.index);
                        closeSlot();
                    }
                }}

                onDelete={() => {
                    closeSlot();
                    if (selectedSlot) onDeleteFragment?.(selectedSlot.index);
                }}

                onClearAutosave={() => {
                    closeSlot();
                    if (selectedSlot) onClearAutosave?.();
                }}
            />

            <div className="coursebot-base__content">

                <div
                    className={
                        `coursebot-base__slot autosave 
                        ${coursebotMode === "save" ? "locked" : ""}
                        ${bouncingSlotIndex === 0 ? "bouncing" : ""}`
                    }
                    onClick={() => openSlot(true, 0, slotData?.autosave)}
                >
                    <div className={`coursebot-slot__preview ${(slotData?.autosave?.thumbnailUrl && (!fillingSlotIndex || coursebotMode !== 'autosave')) ? `with-data` : ``} ${(fillingSlotIndex === 0 && coursebotMode === 'autosave') ? "filling" : ""}`}>
                        {slotData?.autosave && <img src={slotData.autosave.thumbnailUrl} />}
                    </div>
                    <span className="coursebot-slot__title">Автосохранение</span>
                </div>

                {slotData?.fragments.map((slot, idx) => {
                    const slotIndex = idx + 1;

                    return (
                        <div
                            key={idx}
                            className={
                                `coursebot-base__slot 
                                ${bouncingSlotIndex === slotIndex ? "bouncing" : ""}`
                            }
                            onClick={() => openSlot(false, slotIndex, slot)}
                        >
                            <div className={`coursebot-slot__preview ${(slot.thumbnailUrl && !fillingSlotIndex) ? `with-data` : ``} ${fillingSlotIndex === slotIndex ? "filling" : ""}`}>
                                {slot.thumbnailUrl && <img src={slot.thumbnailUrl} />}
                            </div>

                            <span className="coursebot-slot__title">
                                {formatSlotTitle(slot.title)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
