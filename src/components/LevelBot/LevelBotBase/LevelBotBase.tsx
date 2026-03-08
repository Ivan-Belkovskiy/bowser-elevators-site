import React, { createContext, useState } from "react";
import "./LevelBotBase.css";
import { CoursebotFloorSlotConfig, SlotData } from "@/types/elevator";
import { LevelBotModalProps, LevelBotTransitionState } from "../LevelBotModal";
import SlotInfoModal from "../SlotInfoModal/SlotInfoModal";

export default function LevelbotBase({ slotData, onSlotModalOpened, onSlotModalClosed, transitionState, coursebotMode, onSelect }: { slotData?: CoursebotFloorSlotConfig, onSlotModalOpened?: () => void, onSlotModalClosed?: () => void, onSelect?: (slot: SlotData) => void, transitionState: LevelBotTransitionState, coursebotMode: LevelBotModalProps['mode'] }) {
    const [selectedSlot, setSelectedSlot] = useState<{
        isAutosave: boolean,
        data: SlotData | undefined
    } | null>(null);
    const selectSlot = (isAutosave: boolean, data?: SlotData) => {
        onSlotModalOpened?.();
        setSelectedSlot({
            isAutosave,
            data,
        });
    }

    return (
        <div className="coursebot-base">
            <div className="coursebot-base__top">
                <div className="coursebot-base__buttons">
                    <button className="coursebot-base__button tab-button active-tab">Сохраненные фрагменты</button>
                    <button className="coursebot-base__button tab-button" disabled>MyLift AI Editor</button>
                </div>
                <div className="coursebot-base__buttons-decoration"></div>
            </div>
            <div className={`coursebot-base__transition ${transitionState === "closing" || transitionState === "closed" ? "active" : ""}`}></div>

            <SlotInfoModal
                mode={coursebotMode}
                slotData={selectedSlot}
                onClose={() => {
                    onSlotModalClosed?.();
                    setSelectedSlot(null);
                }}
            />

            <div className="coursebot-base__content">
                <div className="coursebot-base__slot autosave" onClick={() => {
                    selectSlot(true, slotData?.autosave);
                }}>
                    <div className="coursebot-slot__preview">
                        {slotData?.autosave && (
                            <img src={slotData.autosave.thumbnailUrl} />
                        )}
                    </div>
                    <div className="coursebot-slot__title">
                        Автосохранение
                    </div>
                </div>
                {slotData?.fragments.map((slot, idx) => (
                    <div key={idx} className="coursebot-base__slot" onClick={() => selectSlot(false, slot)}>
                        <div className="coursebot-slot__preview">
                            {slot.thumbnailUrl && (
                                <img src={slot.thumbnailUrl} />
                            )}
                        </div>
                        <div className="coursebot-slot__title">
                            {slot.title}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}