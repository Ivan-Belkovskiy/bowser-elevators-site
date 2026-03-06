'use client';
import { useState } from "react";
import ElevatorVideoPlayer from "../ElevatorVideoPlayer/ElevatorVideoPlayer";
import "./MyLiftEditor.css";
import CustomButton from "../CustomButton/CustomButton";
import MyLiftEditorModal from "./MyLiftEditorModal/MyLiftEditorModal";
import { CATEGORIES, CategoryDefinition } from "@/constants/elevatorPanel";

export default function MyLiftEditor({ elevator }: { elevator: any }) {
    const [modalCategory, setModalCategory] = useState<CategoryDefinition | null>(null);
    const [previewMode, setPreviewMode] = useState<boolean>(false);

    const switchCategory = (category: CategoryDefinition) => {
        if (modalCategory === category) return setModalCategory(null);
        setModalCategory(category);
    }

    return (
        <div className="mylift-editor">
            <title>{`${elevator.title} | MyLift Editor` || `MyLift Editor`}</title>
            <div className="mylift-editor__elevator-container">
                <ElevatorVideoPlayer liftData={elevator} editMode={!previewMode} />
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
                    {/* <CustomButton
                        className="mylift-editor__button"
                        tooltipClassName="mylift-editor__button-tooltip"
                        image="/images/liftPanel_mainInfo.svg"
                        disabled={previewMode}
                        tooltip="Основная информация"
                    />
                    <CustomButton
                        className="mylift-editor__button"
                        tooltipClassName="mylift-editor__button-tooltip"
                        image="/images/liftPanel_elevatorSettings.svg"
                        disabled={previewMode}
                        tooltip="Лифт"
                    />
                    <CustomButton
                        className="mylift-editor__button"
                        tooltipClassName="mylift-editor__button-tooltip"
                        image="/images/liftPanel_coursebotOptions.svg"
                        disabled={previewMode}
                        tooltip="Уровнебот"
                    /> */}
                </div>
            </div>
            <MyLiftEditorModal activeCondition={modalCategory !== null && !previewMode} category={modalCategory} elevator={elevator} />
        </div>
    );
}