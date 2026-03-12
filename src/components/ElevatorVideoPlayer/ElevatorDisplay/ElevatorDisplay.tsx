import { ElevatorDirections, ElevatorDisplayConfig, ElevatorDisplayTypes } from "@/types/elevator";
import "./ElevatorDisplay.css";
import { generateDisplaySVG } from "@/utils/elevator/displayGenerator";
import { CSSProperties, useEffect, useRef } from "react";
import AudioController from "@/core/audio/AudioController";

export default function ElevatorDisplay({
    inElevator,
    type,
    floor,
    direction,
    data,
    styles,
    onClick,
    editMode,
    isEditing,
    options
}: {
    inElevator?: boolean,
    type: ElevatorDisplayTypes,
    floor: number,
    direction: ElevatorDirections,
    data?: ElevatorDisplayConfig,
    styles?: CSSProperties,
    onClick?: () => any,
    editMode?: boolean,
    isEditing?: boolean,
    options?: ElevatorDisplayConfig['options']
}) {

    const prevFloor = useRef<number>(floor);
    const prevDirection = useRef<ElevatorDirections>(direction);

    // -----------------------------
    // Background music control
    // -----------------------------
    useEffect(() => {
        if (options?.backgroundMusic === true && !editMode) {
            AudioController.enableElevatorMusic();
        } else {
            AudioController.disableElevatorMusic();
        }
    }, [options?.backgroundMusic, editMode]);

    // -----------------------------
    // Floor announcements
    // -----------------------------
    useEffect(() => {
        if (editMode) return;

        if (floor !== prevFloor.current) {
            AudioController.playFloorAnnouncement(floor);
            prevFloor.current = floor;
        }
    }, [floor, editMode]);

    // -----------------------------
    // Direction announcements
    // -----------------------------
    useEffect(() => {
        if (editMode) return;

        if (direction !== prevDirection.current && direction !== "NONE") {
            AudioController.playDirectionAnnouncement(direction);
            prevDirection.current = direction;
        }
    }, [direction, editMode]);

    return (
        <div
            className={`elevator-display ${(inElevator === true) ? 'in-elevator' : ''} ${(editMode) ? 'edit-mode' : ''} ${(isEditing) ? 'editing' : ''}`}
            style={styles}
            dangerouslySetInnerHTML={{
                __html: generateDisplaySVG(type, {
                    floor,
                    direction,
                    indicationColor: String(data?.options?.indicationColor || "red")
                })
            }}
            onClick={onClick}
        ></div>
    );
}
