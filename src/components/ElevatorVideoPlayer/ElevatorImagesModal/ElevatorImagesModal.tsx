import { LiftJson } from "@/types/elevator";
import "./ElevatorImagesModal.css";

export type ElevatorImagesModalType = "leftWall" | "rightWall" | "leftDoor" | "rightDoor" | "buttonPanel";

export default function ElevatorImagesModal({ elevator, type, onSave, onClose }: {
    elevator: LiftJson;
    type?: ElevatorImagesModalType | null;
    onSave?: () => void;
    onClose?: () => void;
}) {

    const position = {
        leftWall: {
            top: 100,
            left: 700,
        },
        rightWall: {
            top: 0,
            left: 0,
        },
        leftDoor: {
            top: 0,
            left: 0,
        },
        rightDoor: {
            top: 0,
            left: 0,
        },
        buttonPanel: {
            top: 0,
            left: 0,
        },
    };


    if (type) return (
        <div className="elevator-images-modal__overlay">
            <div className="elevator-images-modal" style={{ top: `${position[type].top}px`, left: `${position[type].left}px` }}>

            </div>
        </div>
    );
}