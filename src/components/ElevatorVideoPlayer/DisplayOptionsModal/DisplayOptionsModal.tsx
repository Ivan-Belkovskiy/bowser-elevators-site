'use client';
import { ElevatorDisplayConfig, ElevatorDisplayTypes, LiftJson } from "@/types/elevator";
import ElevatorDisplay from "../ElevatorDisplay/ElevatorDisplay";
import "./DisplayOptionsModal.css";
import { DisplayParamOptCondition, DISPLAYS } from "@/constants/displays";
import { useEffect, useState } from "react";
import DisplaySelectModal from "./DisplaySelectModal/DisplaySelectModal";

export default function DisplayOptionsModal({ elevator, display, onSave, onClose }: { elevator: LiftJson, display?: ElevatorDisplayConfig | null, onSave?: (updated: ElevatorDisplayConfig) => void, onClose?: () => void }) {
    const [editingDisplay, setEditingDisplay] = useState<ElevatorDisplayConfig | undefined | null>(display);
    const [isSelectionOpened, setSelectionOpened] = useState<boolean>(false);
    const currentDisplay = DISPLAYS.find(d => d.id === editingDisplay?.type);

    const validateOptionByCondition = (display: ElevatorDisplayConfig, condition?: DisplayParamOptCondition) => {
        if (!condition) return true;
        if (!display) return false;
        return condition.values.includes(display.options[condition.id]);
    }

    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append("updated_display_data", JSON.stringify(editingDisplay));

            const res = await fetch(`/api/elevators/${elevator.id}`, {
                method: "PUT",
                body: formData,
            });

            const data: { success: boolean; lift: LiftJson } = await res.json();

            if (data.success) {
                onSave?.(data.lift.elevator.display);
            }

        } catch (error) {
            console.error('Ошибка сохранения!');
        }
    }
    
    const onDisplaySelect = (type: ElevatorDisplayTypes) => {
        setEditingDisplay({
            type,
            options: {}
        });
        setSelectionOpened(false);
    }

    useEffect(() => setEditingDisplay(display), [display]);

    return (editingDisplay && currentDisplay) ? (
        <div className="display-options-modal__overlay">
            <div className="display-options-modal">
                <div className="display-options-modal__header">
                    <h1 className="display-options-modal__title">Настройки Табло Индикации</h1>
                </div>
                <div className="display-options-modal__container">
                    <div className="display-options-modal__content">
                        <div className="display-options-modal__primary">
                            <ElevatorDisplay type={editingDisplay.type} floor={1} direction="NONE" styles={{
                                scale: 0.8
                            }} data={editingDisplay} />
                            <span className="display-options-modal__label display-label">{currentDisplay?.label}</span>
                            <button
                                className="display-options-modal__button display-selection-btn"
                                onClick={() => setSelectionOpened(true)}
                            >Выбрать табло индикации</button>
                        </div>
                        <div className="display-options-modal__secondary">
                            {currentDisplay.params.map((param, idx) => (
                                <div key={idx} className="display-options-modal__block display-parameter">
                                    <span className="display-options-modal__label display-param-label">{param.label}:</span>
                                    {param.type === 'select' ? (
                                        <select
                                            className="display-options-modal__select display-param-select"
                                            value={String(editingDisplay.options[param.id]) ?? ""}
                                            onChange={(e) => setEditingDisplay({
                                                ...editingDisplay,
                                                options: {
                                                    ...editingDisplay.options,
                                                    [param.id]: e.target.value,
                                                }
                                            })}
                                        >
                                            {param.options?.map((opt, i) => validateOptionByCondition(editingDisplay, opt.condition) && (
                                                <option key={i} value={String(opt.value)}>{opt.label}</option>
                                            ))}
                                        </select>
                                    ) : (param.type === 'boolean') ? (
                                        <input
                                            type="checkbox"
                                            className="display-options-modal__input display-param-boolean"
                                            checked={Boolean(editingDisplay.options[param.id])}
                                            onChange={(e) => setEditingDisplay({
                                                ...editingDisplay,
                                                options: {
                                                    ...editingDisplay.options,
                                                    [param.id]: e.target.checked,
                                                }
                                            })}
                                        />
                                    ) : (param.type === 'number') ? (
                                        <input
                                            type="number" className="display-options-modal__input display-param-number"
                                            value={Number(editingDisplay.options[param.id])}
                                            onChange={(e) => setEditingDisplay({
                                                ...editingDisplay,
                                                options: {
                                                    ...editingDisplay.options,
                                                    [param.id]: Number(e.target.value),
                                                }
                                            })}

                                        />
                                    ) : (
                                        <input
                                            type="text" className="display-options-modal__input display-param-text"
                                            value={String(editingDisplay.options[param.id])}
                                            onChange={(e) => setEditingDisplay({
                                                ...editingDisplay,
                                                options: {
                                                    ...editingDisplay.options,
                                                    [param.id]: e.target.value,
                                                }
                                            })}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="display-options-modal__buttons">
                        <button className="display-options-modal__button save-button" onClick={handleSave}>Сохранить изменения</button>
                        <button className="display-options-modal__button close-button" onClick={() => onClose?.()}>Отменить и закрыть окно</button>
                    </div>
                    <DisplaySelectModal
                        opened={isSelectionOpened}
                        currentDisplay={editingDisplay}
                        onSelect={onDisplaySelect}
                        onClose={() => setSelectionOpened(false)}
                    />
                </div>
            </div>
        </div>
    ) : <></>;
}