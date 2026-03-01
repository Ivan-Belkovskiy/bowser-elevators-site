'use client';
import { useState } from "react";
import ElevatorVideoPlayer from "../ElevatorVideoPlayer/ElevatorVideoPlayer";
import "./MyLiftEditor.css";

export default function MyLiftEditor({ elevator }: { elevator: any }) {
    const [previewMode, setPreviewMode] = useState<boolean>(false);
    return (
        <div className="mylift-editor">
            <title>{`${elevator.title} | MyLift Editor` || `MyLift Editor`}</title>
            <div className="mylift-editor__elevator-container"> 
                <ElevatorVideoPlayer liftData={elevator} editMode={!previewMode} />
                <div className="mylift-editor__toolbar">
                    <button className={`mylift-editor__button ${previewMode && 'preview-mode'}`} onClick={() => setPreviewMode(!previewMode)}>{previewMode ? "↩" : "▶"}</button>
                </div>
            </div>
        </div>
    );
}