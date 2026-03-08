'use client';

import { LiftJson, SlotData } from "@/types/elevator";
import "./LevelBotModal.css";
import { useMemo, useState } from "react";
import LevelBotHead from "./LevelBotHead/LevelBotHead";
import LevelbotBase from "./LevelBotBase/LevelBotBase";
import LevelBotSidebar from "./LevelBotSidebar/LevelBotSidebar";

export type LevelBotTransitionState =
    | "idle"
    | "closing"
    | "closed"
    | "opening";

export interface LevelBotTransitionOptions {
    onlyHead?: boolean;
    onlyBase?: boolean;
}

export interface LevelBotTransitionConfig {
    state: LevelBotTransitionState;
    options?: LevelBotTransitionOptions;
}

export interface LevelBotModalProps {
    elevator: LiftJson;
    activeFloorId: string;
    mode: "default" | "load" | "save";
    onClose: () => void;
    onOpenInMyLiftPlayer: (slot: SlotData, floorId: string) => void;
    onOpenInCoursebotPlayer: (slot: SlotData, floorId: string) => void;
}

export default function LevelBotModal({
    elevator,
    activeFloorId,
    mode,
    onClose,
    onOpenInMyLiftPlayer,
    onOpenInCoursebotPlayer,
}: LevelBotModalProps) {

    const { floors, coursebot } = elevator;

    const [currentFloorId, setCurrentFloorId] = useState(activeFloorId);
    const [pendingFloorId, setPendingFloorId] = useState(activeFloorId);
    const [isAnimating, setAnimating] = useState(false);

    const [isSidebarDisabled, setSidebarDisabled] = useState(false);

    const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null);
    const [transitionState, setTransitionState] = useState<LevelBotTransitionConfig>({
        state: "idle",
        options: {}
    });

    const updateTransitionState = (state: LevelBotTransitionState, options?: LevelBotTransitionOptions) => {
        setTransitionState({
            state,
            options,
        });
    }


    const currentFloor = useMemo(
        () => floors.find(f => f.id === currentFloorId) ?? floors[0],
        [floors, currentFloorId]
    );

    const floorSlots = coursebot.slots[currentFloor.id] ?? {
        autosave: undefined,
        fragments: [] as SlotData[],
    };

    const videoTitle = currentFloor.videoData?.title ?? "Без видео";


    const onFloorSelect = (newFloorId: string) => {
        if (newFloorId === pendingFloorId || isAnimating) return;

        setAnimating(true);

        setPendingFloorId(newFloorId);

        setTimeout(() => {
            updateTransitionState("closing");

            setTimeout(() => {
                setCurrentFloorId(newFloorId);
                updateTransitionState("closed");

                setTimeout(() => {
                    updateTransitionState("opening");

                    setTimeout(() => {
                        updateTransitionState("idle");
                        setAnimating(false);
                    }, 300);

                }, 150);

            }, 300);
        }, 300);
    }


    return (
        <div className="levelbot-overlay">
            <button className="coursebot__button close-button" onClick={onClose}>↩</button>
            <LevelBotHead
                message={`${currentFloor.displaySymbol}F :: ${videoTitle}`}
                transitionState={transitionState.options?.onlyBase ? 'idle' : transitionState.state}
            />

            <LevelbotBase
                slotData={floorSlots}
                transitionState={transitionState.options?.onlyHead ? 'idle' : transitionState.state}
                coursebotMode={mode}
                onSlotModalOpened={() => {
                    updateTransitionState('closed', { onlyHead: true });
                    setSidebarDisabled(true);
                }}
                onSlotModalClosed={() => {
                    updateTransitionState('idle', { onlyHead: true });
                    setSidebarDisabled(false);
                }}
            />

            <LevelBotSidebar
                currentFloor={pendingFloorId}
                floors={floors}
                onSelect={onFloorSelect}
                disabled={isSidebarDisabled}
            />

        </div>
    );
}
