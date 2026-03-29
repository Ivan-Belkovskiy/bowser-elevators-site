'use client';
import { useEffect, useState } from "react";
import ElevatorVideoPlayer from "../ElevatorVideoPlayer/ElevatorVideoPlayer";
import "./MyLiftEditor.css";
import CustomButton from "../CustomButton/CustomButton";
import MyLiftEditorModal from "./MyLiftEditorModal/MyLiftEditorModal";
import { CATEGORIES, CategoryDefinition } from "@/constants/elevatorPanel";
import { LiftJson } from "@/types/elevator";
import ElevatorImagesModal, { ElevatorImagesModalType } from "../ElevatorVideoPlayer/ElevatorImagesModal/ElevatorImagesModal";
import { useRouter } from "next/navigation";

export default function MyLiftEditor({ elevator }: { elevator: LiftJson }) {
    const [modalCategory, setModalCategory] = useState<CategoryDefinition | null>(null);
    const [previewMode, setPreviewMode] = useState<boolean>(false);
    const [editingLiftData, setEditingLiftData] = useState<LiftJson>(elevator);
    const [imageEditor, setImageEditor] = useState<ElevatorImagesModalType | null>(null);
    const router = useRouter();

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
                <div className={`mylift-editor__toolbar ${(modalCategory !== null && !previewMode && !imageEditor) ? 'active' : ''}`}>
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
                            className={`mylift-editor__button ${(modalCategory === category) ? `active-button` : ``}`}
                            tooltipClassName="mylift-editor__button-tooltip"
                            image={category.buttonData?.image}
                            text={category.buttonData?.text}
                            disabled={previewMode}
                            tooltip={category.label}
                            onClick={() => switchCategory(category)}
                        />
                    ))}
                    <CustomButton
                        text="↵"
                        className={`mylift-editor__button exit-button`}
                        tooltipClassName="mylift-editor__button-tooltip"
                        onClick={() => router.push('/elevator-video-player')}
                        disabled={previewMode}
                        tooltip={"Назад к списку лифтов"}
                    />
                </div>
            </div>
            <MyLiftEditorModal
                activeCondition={(modalCategory !== null && !previewMode) && !imageEditor}
                category={modalCategory}
                elevator={editingLiftData}
                onSave={onSaveData}
                setImageEditorType={setImageEditor}
            />
            <ElevatorImagesModal
                elevator={editingLiftData}
                setElevatorData={setEditingLiftData}
                type={imageEditor}
                onSave={() => true}
                onClose={() => setImageEditor(null)}
            />
        </div>
    );
}