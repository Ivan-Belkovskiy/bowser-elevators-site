import { ElevatorDirections, ElevatorDisplayTypes } from "@/types/elevator";
import "./ElevatorDisplay.css";
import { generateDisplaySVG } from "@/utils/elevator/displayGenerator";
import { CSSProperties } from "react";

export default function ElevatorDisplay({ type, floor, direction, styles }: { type: ElevatorDisplayTypes, floor: number, direction: ElevatorDirections, styles?: CSSProperties }) {
    return <div className="elevator-display" style={styles} dangerouslySetInnerHTML={{ __html: generateDisplaySVG(type, { floor, direction }) }}></div>;
    // return <div className="elevator-display" style={styles}>{generateDisplaySVG(type, { floor, direction })}</div>;
}