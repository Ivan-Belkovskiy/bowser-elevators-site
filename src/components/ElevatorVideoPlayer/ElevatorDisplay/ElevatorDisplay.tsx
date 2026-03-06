import { ElevatorDirections, ElevatorDisplayConfig, ElevatorDisplayTypes } from "@/types/elevator";
import "./ElevatorDisplay.css";
import { generateDisplaySVG } from "@/utils/elevator/displayGenerator";
import { CSSProperties } from "react";

export default function ElevatorDisplay({ inElevator, type, floor, direction, data, styles, onClick, editMode, isEditing }: { inElevator?: boolean, type: ElevatorDisplayTypes, floor: number, direction: ElevatorDirections, data?: ElevatorDisplayConfig, styles?: CSSProperties, onClick?: () => any, editMode?: boolean, isEditing?: boolean }) {
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