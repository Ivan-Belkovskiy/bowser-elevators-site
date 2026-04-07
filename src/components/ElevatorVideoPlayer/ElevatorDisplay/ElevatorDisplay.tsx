'use client';

import { ElevatorDirections, ElevatorDisplayConfig, ElevatorDisplayTypes } from "@/types/elevator";
import "./ElevatorDisplay.css";
import { generateDisplaySVG } from "@/utils/elevator/displayGenerator";
import { CSSProperties, useEffect, useRef, useState } from "react";
import AudioController from "@/core/audio/AudioController";
import { ElevatorDoorState } from "../ElevatorVideoPlayer";
import { PlayerState } from "@/components/MyLiftPlayer/MyLiftPlayer";

export default function ElevatorDisplay({
    inElevator,
    type,
    floor,
    direction,
    doorState, // Добавляем состояние дверей
    targetFloor,
    moveState,
    data,
    styles,
    onClick,
    editMode,
    isEditing,
    options,
}: {
    inElevator?: boolean,
    type: ElevatorDisplayTypes,
    floor: number,
    direction: ElevatorDirections,
    doorState?: ElevatorDoorState, // Состояние дверей
    data?: ElevatorDisplayConfig,
    targetFloor?: number | null,
    moveState?: string,
    styles?: CSSProperties,
    onClick?: () => any,
    editMode?: boolean,
    isEditing?: boolean,
    options?: ElevatorDisplayConfig['options']
}) {
    const prevFloor = useRef<number>(floor);
    const lastAnnouncedFloor = useRef<number | null>(null);
    const prevDirection = useRef<ElevatorDirections>(direction);
    const prevDoorState = useRef<ElevatorDoorState | undefined>(doorState);

    const offsetRef = useRef(1);
    const [offset, setOffset] = useState(1);
    const [displayFloor, setDisplayFloor] = useState(floor);

    const triggerNotification = (triggerType: "atEndMove" | "atDoorOpen" | "atDoorClose") => {
        if (editMode) return;

        const voiceSetting = options?.voiceNotifications || options?.floorNotifications;
        const beepSetting = options?.endMoveBeep;

        const isVoiceEnabled = voiceSetting === triggerType ||
            (voiceSetting === "atDoorOpenClose" && (triggerType === "atDoorOpen" || triggerType === "atDoorClose"));

        const isBeepEnabled = beepSetting === triggerType ||
            (beepSetting === "atDoorOpenClose" && (triggerType === "atDoorOpen" || triggerType === "atDoorClose"));

        const playVoice = () => {
            AudioController.playFloorNotification(floor);
        };

        const playBeep = () => {
            // AudioController.playArrivalBeep?.(); 
        };

        if (isVoiceEnabled && beepSetting === "beforeFloorNotification") {
            playBeep();
            setTimeout(playVoice, 700);
            return;
        }

        if (isVoiceEnabled && beepSetting === "withFloorNotification") {
            playBeep();
            playVoice();
            return;
        }

        if (isBeepEnabled) playBeep();
        if (isVoiceEnabled) playVoice();
    };

    useEffect(() => {

        const isArriving = moveState === "END";
        const isCorrectOption = options?.voiceNotifications === "atEndMove" || options?.floorNotifications === "atEndMove";

        if (isArriving) {
            if (lastAnnouncedFloor.current !== floor) {

                const playSequence = async () => {
                    if (moveState !== 'END') return;
                    // if (options?.endMoveBeep) {
                    if (
                        (options?.endMoveBeep === 'beforeFloorNotification' && isCorrectOption) ||
                        options?.endMoveBeep === 'atEndMove'
                    ) {
                        await AudioController.playEndMoveBeep(type);
                        AudioController.setVolume({
                            music: {
                                ...AudioController.volume.music,
                                on: false,
                            }
                        });
                    }
                    if (isCorrectOption) setTimeout(() => {
                        AudioController.playFloorNotification(floor)?.then(() => {
                            AudioController.setVolume({
                                music: {
                                    ...AudioController.volume.music,
                                    on: true,
                                }
                            });
                        });
                        // setTimeout(() => {

                        // }, 1000);
                    }, 2700);
                    // } else {
                    // AudioController.playFloorNotification(floor);
                    // }
                };

                playSequence();
                lastAnnouncedFloor.current = floor;
            }
        }

        if (moveState === "MOVE" || direction === "NONE") {
            // lastAnnouncedFloor.current = null;
        }

    }, [moveState, floor, direction, options]);

    useEffect(() => {
        if (editMode || !doorState) return;

        if (prevDoorState.current !== doorState) {
            if (doorState === "opening") {
                triggerNotification("atDoorOpen");
            } else if (doorState === "closing") {
                triggerNotification("atDoorClose");
            }
            prevDoorState.current = doorState;
        }
    }, [doorState]);


    useEffect(() => {
        if (options?.backgroundMusic === true && !editMode) {
            AudioController.enableElevatorMusic();
        } else {
            AudioController.disableElevatorMusic();
        }
    }, [options?.backgroundMusic, editMode]);

    useEffect(() => {
        if (editMode) return;
        if (floor === prevFloor.current) return;

        let frameId: number;
        let timer = 0;

        const animate = () => {
            timer++;
            if (timer % 3 === 0) {
                let nextOffset = (direction === "DOWN") ? offsetRef.current - 1 : offsetRef.current + 1;
                if (Math.abs(nextOffset) === 8) {
                    setDisplayFloor(floor);
                    nextOffset = 1;
                }
                offsetRef.current = nextOffset;
                setOffset(nextOffset);
                if (nextOffset === 1) {
                    prevFloor.current = floor;
                    cancelAnimationFrame(frameId);
                    return;
                }
            }
            frameId = requestAnimationFrame(animate);
        };

        if (type === 'TIM2') {
            frameId = requestAnimationFrame(animate);
        } else {
            setDisplayFloor(floor);
            prevFloor.current = floor;
        }
        return () => cancelAnimationFrame(frameId);
    }, [floor, editMode, type]);

    useEffect(() => {
        if (editMode) return;
        if (direction !== "NONE") {
            const voiceEnabled = options?.voiceNotifications && (options.voiceNotifications !== 'off');

            if (voiceEnabled) {
                setTimeout(() => {
                    AudioController.playDirectionNotification(direction);
                }, 1000);
            }
            prevDirection.current = direction;
        }
    }, [direction, editMode, options]);

    return (
        <div
            className={`elevator-display ${inElevator ? 'in-elevator' : ''} ${editMode ? 'edit-mode' : ''} ${isEditing ? 'editing' : ''}`}
            style={{
                ...styles,
                marginTop: (data?.type === "TL-D70" && inElevator) ? '-95px' : styles?.marginTop,
                marginLeft: (data?.type === "TL-D70" && inElevator) ? '30px' : styles?.marginLeft
            }}
            dangerouslySetInnerHTML={{
                __html: generateDisplaySVG(type, {
                    floor: displayFloor,
                    direction,
                    indicationColor: String(data?.options?.indicationColor || "red"),
                    offset: offset,
                })
            }}
            onClick={onClick}
        ></div>
    );
}