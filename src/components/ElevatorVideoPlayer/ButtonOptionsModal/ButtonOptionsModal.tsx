'use client';
import ModalWrapper from "@/components/ModalWrapper/ModalWrapper";
import "./ButtonOptionsModal.css";
import { ElevatorButton, LiftJson } from "@/types/elevator";
import { CSSProperties, useEffect, useState } from "react";
import TabButton from "@/components/TabButton/TabButton";
import TabButtonGroup from "@/components/TabButtonGroup/TabButtonGroup";
import FileUploader from "@/components/FileUploader/FileUploader";
import { ELEMENTS, ActionParamOption } from "@/constants/elements";

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
        // if (updatedButton.type === 'floor') console.log('FLOOR:' + updatedButton.destinationFloor);
        if (!selectedAction?.params && updatedButton.type === 'action') delete updatedButton.action.params;

        const buttonData = {
            blockIdx: button[0],
            buttonIdx: button[1],
            styleEditMode,
            buttonEditMode: btnEditMode,
            data: {
                destinationFloor: updatedButton.type === "floor" ? updatedButton.destinationFloor : null,
                showFloorSymbol: updatedButton.type === "floor" ? updatedButton.showFloorSymbol : null,
                styles: buttonStyles,
                action: (updatedButton.type === "action") ? updatedButton.action : null,
                innerText: (updatedButton.type === "action") ? (updatedButton.innerText || null) : null,
            }
        };

        formData.append("updated_button_data", JSON.stringify(buttonData));

        if (uploadedImage) {
            formData.append("uploadedImage", uploadedImage);
        }

        const res = await fetch(`/api/elevators/${elevator.id}`, {
            method: "PUT",
            body: formData,
        });

        const data = await res.json();
        if (data.success) {
            updatedButton.styles[btnEditMode] =
                data.lift.elevator.buttonPanel.blocks[button[0]].buttons[button[1]].styles[btnEditMode];
            if (updatedButton.type === "floor" && styleEditMode === "image") {
                updatedButton.showFloorSymbol = false;
            } else if (updatedButton.type === "action" && styleEditMode === "image") {
                updatedButton.innerText = {
                    on: false,
                    text: "",
                };
            }
        }

        onSave(button[0], button[1], updatedButton);
    };

    const selectedElement = ELEMENTS.find(el => (currentButton.type === 'action') && el.id === currentButton.action?.element);
    const selectedAction = selectedElement?.actions.find(act => (currentButton.type === 'action') && act.id === currentButton.action?.command);


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
                                            <button className="button-options-modal__elevator-button" style={buttonStyles[styleEditMode]}>
                                                {(currentButton.type === 'floor' && currentButton.showFloorSymbol) ? currentButton.destinationFloor + 1 : (currentButton.type === 'action' && currentButton.innerText?.on) && currentButton.innerText.text}
                                            </button>
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
                                            {(currentButton.type === 'floor') ? (
                                                <>
                                                    <div className="button-options-modal__button-property">
                                                        <span className="button-options-modal__label">Символ этажа:</span>
                                                        <input
                                                            type="checkbox"
                                                            checked={currentButton.showFloorSymbol || false}
                                                            onChange={(e) => updateButtonData('showFloorSymbol', e.target.checked)}
                                                        />
                                                    </div>
                                                    {(currentButton.showFloorSymbol) && (
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
                                                </>

                                            ) : (
                                                <>
                                                    <div className="button-options-modal__button-property">
                                                        <span className="button-options-modal__label">Текст кнопки:</span>
                                                        <input
                                                            type="checkbox"
                                                            checked={currentButton.innerText?.on || false}
                                                            onChange={(e) => updateButtonData('innerText', {
                                                                ...currentButton.innerText,
                                                                on: e.target.checked,
                                                            })}
                                                        />
                                                    </div>
                                                    {(currentButton.innerText?.on) && (
                                                        <>
                                                            <div className="button-options-modal__button-property">
                                                                <span className="button-options-modal__label">Текст:</span>
                                                                <input
                                                                    type="text"
                                                                    className="button-options-modal__input button-text-input"
                                                                    value={currentButton.innerText.text || ''}
                                                                    onChange={(e) => updateButtonData('innerText', {
                                                                        ...currentButton.innerText,
                                                                        text: e.target.value,
                                                                    })}
                                                                />
                                                            </div>
                                                            <div className="button-options-modal__button-property">
                                                                <span className="button-options-modal__label">Цвет текста:</span>
                                                                <input
                                                                    type="color"
                                                                    value={buttonStyles[styleEditMode].color || '#000'}
                                                                    onChange={(e) => updateButtonStyles({
                                                                        ...buttonStyles[styleEditMode],
                                                                        color: e.target.value,
                                                                    })}
                                                                />
                                                            </div>
                                                            <div className="button-options-modal__button-property">
                                                                <span className="button-options-modal__label">Размер текста:</span>
                                                                <input
                                                                    type="range"
                                                                    min={8}
                                                                    max={15}
                                                                    step={1}
                                                                    value={buttonStyles[styleEditMode].fontSize || 15}
                                                                    onChange={(e) => updateButtonStyles({
                                                                        ...buttonStyles[styleEditMode],
                                                                        fontSize: parseInt(e.target.value),
                                                                    })}
                                                                />
                                                            </div>
                                                        </>
                                                    )}
                                                </>
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
                                <div className="button-options-modal__properties" style={{
                                    marginLeft: 5
                                }}>
                                    <div className="button-options-modal__property">
                                        <select
                                            className="button-options-modal__input element-input"
                                            value={currentButton.action.element}
                                            onChange={(e) => {
                                                const selectedElement = ELEMENTS.find(el => el.id === e.target.value);
                                                setCurrentButton({
                                                    ...currentButton,
                                                    action: {
                                                        element: e.target.value,
                                                        command: selectedElement?.actions[0].id || "",
                                                        params: {}
                                                    }

                                                })
                                            }}
                                        // disabled
                                        // onChange={(e) => updateButtonData('destinationFloor', Number(e.target.value))}
                                        >
                                            {ELEMENTS.map((el, idx) => (
                                                <option value={el.id} key={idx}>{el.label}</option>
                                            ))}
                                        </select>
                                        <span className="button-options-modal__label ml-2">::</span>
                                        <select
                                            className="button-options-modal__input action-input"
                                            value={currentButton.action.command}
                                            onChange={(e) => {
                                                const newCommand = e.target.value;

                                                const selectedElement = ELEMENTS.find(el => el.id === currentButton.action.element);
                                                const newAction = selectedElement?.actions.find(a => a.id === newCommand);

                                                setCurrentButton({
                                                    ...currentButton,
                                                    action: {
                                                        element: currentButton.action.element,
                                                        command: newCommand,
                                                        params: newAction?.params ? {} : undefined
                                                    }
                                                });
                                            }}

                                        >
                                            {selectedElement?.actions.map((action, idx) => (
                                                <option value={action.id} key={idx}>{action.label}</option>
                                            ))}
                                            {/* <option value=""></option> */}
                                        </select>
                                    </div>
                                    {selectedAction?.params?.map((param, index) => {
                                        const value = currentButton.action.params?.[param.id];

                                        if (param.type === "select") {
                                            let options = param.options;

                                            if (param.optionsSource === "floors") {
                                                options = elevator.floors.map((_, i) => ({
                                                    value: i,
                                                    label: `${i + 1}F`
                                                }));
                                            }

                                            return (
                                                <div key={index} className="button-options-modal__property action-parameter">
                                                    <span className="button-options-modal__label ml-2">{param.label}:</span>
                                                    <select
                                                        className="button-options-modal__input floor-input"
                                                        value={value ?? ""}
                                                        onChange={(e) =>
                                                            setCurrentButton({
                                                                ...currentButton,
                                                                action: {
                                                                    ...currentButton.action,
                                                                    params: {
                                                                        ...currentButton.action.params,
                                                                        [param.id]: e.target.value
                                                                    }
                                                                }
                                                            })
                                                        }
                                                    >
                                                        {options?.map((opt, idx) => (
                                                            <option key={idx} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            );
                                        }

                                        if (param.type === "number") {
                                            return (
                                                <div key={index} className="button-options-modal__property action-parameter">
                                                    <span className="button-options-modal__label ml-2">{param.label}:</span>
                                                    <input
                                                        type="number"
                                                        value={value ?? ""}
                                                        onChange={(e) =>
                                                            setCurrentButton({
                                                                ...currentButton,
                                                                action: {
                                                                    ...currentButton.action,
                                                                    params: {
                                                                        ...currentButton.action.params,
                                                                        [param.id]: Number(e.target.value)
                                                                    }
                                                                }
                                                            })
                                                        }
                                                    />
                                                </div>
                                            );
                                        }

                                        if (param.type === "string") {
                                            return (
                                                <div key={index} className="button-options-modal__property action-parameter">
                                                    <span className="button-options-modal__label ml-2">{param.label}:</span>
                                                    <input
                                                        type="text"
                                                        value={value ?? ""}
                                                        onChange={(e) =>
                                                            setCurrentButton({
                                                                ...currentButton,
                                                                action: {
                                                                    ...currentButton.action,
                                                                    params: {
                                                                        ...currentButton.action.params,
                                                                        [param.id]: e.target.value
                                                                    }
                                                                }
                                                            })
                                                        }
                                                    />
                                                </div>
                                            );
                                        }

                                        if (param.type === "boolean") {
                                            return (
                                                <div key={index} className="button-options-modal__property action-parameter">
                                                    <span className="button-options-modal__label ml-2">{param.label}:</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={value ?? false}
                                                        onChange={(e) =>
                                                            setCurrentButton({
                                                                ...currentButton,
                                                                action: {
                                                                    ...currentButton.action,
                                                                    params: {
                                                                        ...currentButton.action.params,
                                                                        [param.id]: e.target.checked
                                                                    }
                                                                }
                                                            })
                                                        }
                                                    />
                                                </div>
                                            );
                                        }

                                        return null;
                                    })}

                                </div>
                            )}
                        </div>
                    </div>
                    <div className="button-options-modal__buttons">
                        <button className="button-options-modal__button save-button" onClick={handleSave}>Сохранить изменения</button>
                        <button className="button-options-modal__button close-button" onClick={() => onClose()}>Отменить и закрыть окно</button>
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
}