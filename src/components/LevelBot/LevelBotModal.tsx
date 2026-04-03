'use client';

import AudioController from "@/core/audio/AudioController";
import { LiftJson, SlotData } from "@/types/elevator";
import "./LevelBotModal.css";
import { useEffect, useMemo, useState } from "react";
import LevelBotHead from "./LevelBotHead/LevelBotHead";
import LevelbotBase from "./LevelBotBase/LevelBotBase";
import LevelBotSidebar from "./LevelBotSidebar/LevelBotSidebar";
import { EditingSlotData } from "./SlotInfoModal/SlotInfoModal";
import { MyLiftPlayerMode } from "../MyLiftPlayer/MyLiftPlayer";

export type LevelBotMode = "default" | "load" | "save" | "autosave";

export interface SavePayload {
    timecode: number;
    thumbnailUrl: string;
    createdAt: string;
    videoId: string;
    floorId: string;
}

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
    mode: LevelBotMode;

    savePayload?: SavePayload;

    onClose: () => void;

    onOpenInMyLiftPlayer: (slot: SlotData, floorId: string, isAutosave?: boolean, playerMode?: MyLiftPlayerMode) => void;
    onOpenInCoursebotPlayer: (slot: SlotData, floorId: string, isAutosave?: boolean) => void;

    onSaveFragment?: (payload: SavePayload & { title: string; slotIndex: number }) => void;
    onAutoSave?: (payload?: SavePayload) => void;
    onClearAutosave?: (floorId: string) => void;
    onOverwriteFragment?: (payload: SavePayload & { title: string; slotIndex: number }) => void;
    onDeleteFragment?: (slotIndex: number, floorId: string) => void;
    onEditFragment?: (data: EditingSlotData, floorId: string, slotIndex: number) => void;
}

export default function LevelBotModal({
    elevator,
    activeFloorId,
    mode,
    savePayload,
    onClose,
    onOpenInMyLiftPlayer,
    onOpenInCoursebotPlayer,
    onSaveFragment,
    onAutoSave,
    onClearAutosave,
    onOverwriteFragment,
    onEditFragment,
    onDeleteFragment
}: LevelBotModalProps) {

    const { floors, coursebot } = elevator;

    const [currentFloorId, setCurrentFloorId] = useState(activeFloorId);
    const [pendingFloorId, setPendingFloorId] = useState(activeFloorId);
    const [isAnimating, setAnimating] = useState(false);
    const [isSidebarDisabled, setSidebarDisabled] = useState(false);
    const [watchListOpened, setWatchListOpened] = useState(false);

    const [transitionState, setTransitionState] = useState<LevelBotTransitionConfig>({
        state: "idle",
        options: {}
    });

    const updateTransitionState = (state: LevelBotTransitionState, options?: LevelBotTransitionOptions) => {
        setTransitionState({ state, options });
    };

    const currentFloor = useMemo(
        () => floors.find(f => f.id === currentFloorId) ?? floors[0],
        [floors, currentFloorId]
    );

    const floorSlots = coursebot.slots[currentFloor.id] ?? {
        autosave: undefined,
        fragments: [] as SlotData[],
    };

    const videoTitle = currentFloor.videoData?.title ?? "";

    const headMessage =
        mode === "save"
            ? `СОХРАНИТЬ :: ${videoTitle}`
            : mode === "autosave"
                ? `СОХРАНЕНИЕ :: ${videoTitle}`
                : `${currentFloor.displaySymbol}F :: ${videoTitle}`;

    const onFloorSelect = (newFloorId: string) => {
        if (newFloorId === pendingFloorId || isAnimating) return;
        if (mode === "save" || mode === "autosave") return;

        setAnimating(true);
        setPendingFloorId(newFloorId);

        setTimeout(() => {
            updateTransitionState("closing");
            AudioController.playCoursebotSound("tab_switch_drop", "/audio/sound/coursebot/coursebot-switch-floor-drop.wav");

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
        }, 320);
    };

    useEffect(() => {
        AudioController.setVolume({
            music: {
                ...AudioController.volume.music,
                on: false,
            },
            elevator: {
                ...AudioController.volume.elevator,
                on: false,
            }
        });
        AudioController.initCoursebotSounds();
        AudioController.startCoursebotMusic();
        // AudioController.startCoursebotMusic("/audio/music/coursebot/coursebot-music.mp3");
        return () => {
            AudioController.stopCoursebotMusic();
            AudioController.setVolume({
            music: {
                ...AudioController.volume.music,
                on: true,
            },
            elevator: {
                ...AudioController.volume.elevator,
                on: true,
            }
        })
        }
    }, []);

    return (
        <div className="levelbot-overlay">

            {(mode !== 'autosave') && <button className="coursebot__button close-button" onClick={onClose}>↩</button>}

            <LevelBotHead
                message={headMessage}
                mode={mode}
                transitionState={
                    transitionState.options?.onlyBase
                        ? "idle"
                        : transitionState.state
                }
            />

            <LevelbotBase
                currentVideo={currentFloor.videoData}
                videoStats={elevator.videoStats}
                slotData={floorSlots}
                coursebotMode={mode}
                watchListOpened={watchListOpened}
                setWatchListOpened={setWatchListOpened}
                savePayload={savePayload}
                transitionState={
                    transitionState.options?.onlyHead
                        ? "idle"
                        : transitionState.state
                }

                onSlotModalOpened={() => {
                    updateTransitionState("closed", { onlyHead: true });
                    setSidebarDisabled(true);
                }}

                onSlotModalClosed={() => {
                    updateTransitionState("idle", { onlyHead: true });
                    setSidebarDisabled(false);
                }}

                onOpenInMyLiftPlayer={(slot, isAutosave, mode) => onOpenInMyLiftPlayer(slot, currentFloorId, isAutosave, mode)}
                onOpenInCoursebotPlayer={(slot, isAutosave) => onOpenInCoursebotPlayer(slot, currentFloorId, isAutosave)}

                onSaveFragment={(title, slotIndex) => {
                    if (!savePayload) return;
                    onSaveFragment?.({ ...savePayload, title, slotIndex: (slotIndex - 1) });
                }}

                onAutoSave={() => onAutoSave?.(savePayload)}

                onOverwriteFragment={(title, slotIndex) => {
                    if (!savePayload) return;
                    onOverwriteFragment?.({ ...savePayload, title, slotIndex: (slotIndex - 1) });
                }}

                onEditFragment={(data, idx) => {
                    onEditFragment?.(data, currentFloorId, (idx - 1));
                }}

                onDeleteFragment={(slotIndex) => {
                    onDeleteFragment?.(slotIndex - 1, currentFloorId);
                }}

                onClearAutosave={() => onClearAutosave?.(currentFloorId)}

                closeModal={onClose}
            />

            <LevelBotSidebar
                currentFloor={pendingFloorId}
                floors={floors}
                onSelect={onFloorSelect}
                disabled={(isSidebarDisabled || mode === "save" || mode === "autosave") || watchListOpened}
            />

        </div>
    );
}
