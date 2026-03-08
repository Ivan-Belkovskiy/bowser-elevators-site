'use client';
import { useEffect, useState } from "react";
import ElevatorVideoPlayer from "../ElevatorVideoPlayer/ElevatorVideoPlayer";
import "./MyLiftEditor.css";
import CustomButton from "../CustomButton/CustomButton";
import MyLiftEditorModal from "./MyLiftEditorModal/MyLiftEditorModal";
import { CATEGORIES, CategoryDefinition } from "@/constants/elevatorPanel";
import { LiftJson } from "@/types/elevator";

export default function MyLiftEditor({ elevator }: { elevator: LiftJson }) {
    const [modalCategory, setModalCategory] = useState<CategoryDefinition | null>(null);
    const [previewMode, setPreviewMode] = useState<boolean>(false);
    const [editingLiftData, setEditingLiftData] = useState<LiftJson>(elevator);

    const switchCategory = (category: CategoryDefinition | null) => {
        if (modalCategory === category) return setModalCategory(null);
        setModalCategory(category);
    }

    const onSaveData = (updated: LiftJson) => {
        setEditingLiftData(updated);
        switchCategory(null);
    }

    useEffect(() => setEditingLiftData(elevator), [elevator]);

    return (
        <div className="mylift-editor">
            <title>{`${elevator.title} | MyLift Editor` || `MyLift Editor`}</title>
            <div className="mylift-editor__elevator-container">
                <ElevatorVideoPlayer liftData={editingLiftData} editMode={!previewMode} />
                <div className="mylift-editor__toolbar">
                    <CustomButton
                        text={previewMode ? "↩" : "▶"}
                        className={`mylift-editor__button preview-btn ${previewMode ? 'preview-mode' : ''}`}
                        tooltipClassName="mylift-editor__button-tooltip"
                        onClick={() => setPreviewMode(!previewMode)}
                        tooltip={previewMode ? "" : "Проверить"}
                    />
                    {CATEGORIES.map((category, idx) => (
                        <CustomButton
                            key={idx}
                            className="mylift-editor__button"
                            tooltipClassName="mylift-editor__button-tooltip"
                            image={category.buttonData?.image}
                            text={category.buttonData?.text}
                            disabled={previewMode}
                            tooltip={category.label}
                            onClick={() => switchCategory(category)}
                        />
                    ))}
                </div>
            </div>
            <MyLiftEditorModal
                activeCondition={modalCategory !== null && !previewMode}
                category={modalCategory}
                elevator={editingLiftData}
                onSave={onSaveData}
            />
        </div>
    );
}