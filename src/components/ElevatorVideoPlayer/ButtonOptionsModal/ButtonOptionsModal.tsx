'use client';
import ModalWrapper from "@/components/ModalWrapper/ModalWrapper";
import "./ButtonOptionsModal.css";
import { ElevatorButton, LiftJson } from "@/types/elevator";
import { CSSProperties, useEffect, useState } from "react";
import TabButton from "@/components/TabButton/TabButton";
import TabButtonGroup from "@/components/TabButtonGroup/TabButtonGroup";
import FileUploader from "@/components/FileUploader/FileUploader";

interface ButtonStyles {
    [key: string]: CSSProperties
}

export default function ButtonOptionsModal({ elevator, button, onSave, onClose }: { elevator: LiftJson, button: [number, number, ElevatorButton] | null, onSave: (blockIdx: number, buttonIdx: number, button: ElevatorButton) => void, onClose: () => void }) {
    if (!button || button?.[2].type === 'empty') return null;
    const [currentButton, setCurrentButton] = useState<ElevatorButton>(button[2]);
    const [btnEditMode, setBtnEditMode] = useState<'default' | 'active'>('default');
    if (currentButton.type === 'empty') return null;
    const [uploadedImage, setUploadedImage] = useState<File>();
    const [buttonStyles, setButtonStyles] = useState<ButtonStyles>(
        {
            image: ((typeof currentButton.styles[btnEditMode] === 'string') ? {
                backgroundImage: `url('${currentButton.styles[btnEditMode]}')`,
            } : {
                backgroundImage: undefined,
            }),
            styles: (typeof currentButton.styles[btnEditMode] !== 'string') ? currentButton.styles[btnEditMode] as CSSProperties : {
                borderWidth: '3px',
                borderStyle: 'solid',
                borderColor: '#000',
                backgroundColor: '#9c9c9c',
                borderRadius: '50px'
            }
        }
    );

    const [styleEditMode, setStyleEditMode] = useState((typeof currentButton.styles[btnEditMode] === 'string') ? 'image' : 'styles');

    const updateButtonStyles = (newStyles: CSSProperties) => {
        setButtonStyles({
            ...buttonStyles,
            [styleEditMode]: newStyles,
        });

        setCurrentButton({
            ...currentButton,
            styles: {
                ...currentButton.styles,
                [btnEditMode]: newStyles.backgroundImage
                    ? newStyles.backgroundImage.replace(/^url\(['"]?(.+)['"]?\)$/, "$1")
                    : newStyles,
            },
        });

    }

    const updateButtonData = (property: string, value: any) => {
        setCurrentButton({
            ...currentButton,
            [property]: value,
        });
    }

    const handleSave = async () => {
        const formData = new FormData();
        let updatedButton = { ...currentButton };
        if (styleEditMode === 'image') {
            if (uploadedImage) {

                formData.append(
                    `button_image_block${button[0]}_btn${button[1]}_${btnEditMode}`,
                    uploadedImage
                );

                if (updatedButton.type === 'floor') formData.append("button_destination_floor", String(updatedButton.destinationFloor));

                const res = await fetch(`/api/elevators/${elevator.id}`, {
                    method: "PUT",
                    body: formData,
                });

                const data = await res.json();
                if (data.success) {
                    updatedButton.styles[btnEditMode] =
                        data.lift.elevator.buttonPanel.blocks[button[0]].buttons[button[1]].styles[btnEditMode];
                    if (updatedButton.type === 'floor') updatedButton.showFloorSymbol = false;
                }
            }
        } else {
            formData.append("button_style_block", String(button[0]));
            formData.append("button_style_index", String(button[1]));
            formData.append("button_style_mode", btnEditMode); // "default" или "active"
            if (updatedButton.type === 'floor') {
                formData.append("button_show_symbol", updatedButton.showFloorSymbol ? "true" : "false");
                formData.append("button_destination_floor", String(updatedButton.destinationFloor));
            }
            formData.append("button_style_data", JSON.stringify(buttonStyles[styleEditMode]));

            const res = await fetch(`/api/elevators/${elevator.id}`, {
                method: "PUT",
                body: formData,
            });

            const data = await res.json();
            if (data.success) {
                updatedButton.styles[btnEditMode] =
                    data.lift.elevator.buttonPanel.blocks[button[0]].buttons[button[1]].styles[btnEditMode];
            }
        }

        onSave(button[0], button[1], updatedButton);
    };

    useEffect(() => {
        setCurrentButton(button[2]);
    }, [button]);

    return (
        <ModalWrapper>
            <div className="button-options-modal__overlay">
                <div className="button-options-modal">
                    <h1 className="button-options-modal__title">{currentButton.type === 'floor' ? 'Кнопка этажа' : 'Кнопка действия'}</h1>
                    <div className="button-options-modal__content">
                        <div className="button-options-modal__left">
                            <div className="button-options-modal__top">
                                <TabButtonGroup value={styleEditMode} onChange={(val) => setStyleEditMode(val)}>
                                    <TabButton className="button-options-modal__tab-button" value="image" selected>Изображение</TabButton>
                                    <TabButton className="button-options-modal__tab-button" value="styles">Настроить стиль</TabButton>
                                </TabButtonGroup>
                            </div>
                            <div className="button-options-modal__bottom" style={{ flexDirection: (styleEditMode === 'styles') ? 'row' : 'column' }}>
                                {styleEditMode === 'image' ? (
                                    <>
                                        <button className="button-options-modal__elevator-button" style={buttonStyles[styleEditMode]}></button>
                                        <FileUploader
                                            btnClass="button-options-modal__button upload-image-button"
                                            label={{ upload: "Загрузить изображение", replace: "Заменить изображение..." }}
                                            file={uploadedImage}
                                            onUpload={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setUploadedImage(file);
                                                    updateButtonStyles({
                                                        ...buttonStyles[styleEditMode],
                                                        backgroundImage: `url('${URL.createObjectURL(file)}')`,
                                                    });
                                                }
                                            }}
                                            hideMessage
                                            accept="image/*"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <div className="button-options-modal__bottom-left">
                                            <button className="button-options-modal__elevator-button" style={buttonStyles[styleEditMode]}>{(currentButton.type === 'floor' && currentButton.showFloorSymbol) && currentButton.destinationFloor + 1}</button>
                                        </div>
                                        <div className="button-options-modal__bottom-right">
                                            <div className="button-options-modal__button-property">
                                                <span className="button-options-modal__label">Цвет внутренней части:</span>
                                                <input
                                                    type="color"
                                                    value={buttonStyles[styleEditMode].backgroundColor || '#000'}
                                                    onChange={(e) => updateButtonStyles({
                                                        ...buttonStyles[styleEditMode],
                                                        backgroundColor: e.target.value,
                                                    })}
                                                />
                                            </div>
                                            <div className="button-options-modal__button-property">
                                                <span className="button-options-modal__label">Цвет контура:</span>
                                                <input
                                                    type="color"
                                                    value={buttonStyles[styleEditMode].borderColor || '#000'}
                                                    onChange={(e) => updateButtonStyles({
                                                        ...buttonStyles[styleEditMode],
                                                        borderColor: e.target.value,
                                                    })}
                                                />
                                            </div>
                                            <div className="button-options-modal__button-property">
                                                <span className="button-options-modal__label">Символ этажа:</span>
                                                <input
                                                    type="checkbox"
                                                    checked={(currentButton.type === 'floor' && currentButton.showFloorSymbol) || false}
                                                    onChange={(e) => updateButtonData('showFloorSymbol', e.target.checked)}
                                                />
                                            </div>
                                            {(currentButton.type === 'floor' && currentButton.showFloorSymbol) && (
                                                <div className="button-options-modal__button-property">
                                                    <span className="button-options-modal__label">Цвет символа этажа:</span>
                                                    <input
                                                        type="color"
                                                        value={buttonStyles[styleEditMode].color || '#000'}
                                                        onChange={(e) => updateButtonStyles({
                                                            ...buttonStyles[styleEditMode],
                                                            color: e.target.value,
                                                        })}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="button-options-modal__right">
                            {currentButton.type === 'floor' ? (
                                <div className="button-options-modal__properties">
                                    <div className="button-options-modal__property">
                                        <span className="button-options-modal__label">Этаж назначения:</span>
                                        <select
                                            className="button-options-modal__input floor-input"
                                            value={currentButton.destinationFloor}
                                            onChange={(e) => updateButtonData('destinationFloor', Number(e.target.value))}
                                        >
                                            {elevator.floors.map((floor, idx) => (
                                                <option value={idx} key={idx}>{(idx + 1)}F</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <div className="button-options-modal__properties">
                                    <div className="button-options-modal__property">
                                        <span className="button-options-modal__label">Действие:</span>
                                        <select
                                            className="button-options-modal__input floor-input"
                                            value={currentButton.action.element}
                                            onChange={(e) => updateButtonData('destinationFloor', Number(e.target.value))}
                                        >
                                            {elevator.floors.map((floor, idx) => (
                                                <option value={idx} key={idx}>{(idx + 1)}F</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="button-options-modal__buttons">
                        <button className="button-options-modal__button save-button" onClick={handleSave}>Сохранить изменения</button>
                        <button className="button-options-modal__button close-button" onClick={() => onClose()}>Отменить изменения</button>
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
}