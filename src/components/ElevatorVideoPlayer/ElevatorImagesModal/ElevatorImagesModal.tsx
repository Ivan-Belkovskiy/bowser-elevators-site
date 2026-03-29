import { LiftJson } from "@/types/elevator";
import "./ElevatorImagesModal.css";
import FileUploader from "@/components/FileUploader/FileUploader";
import { Dispatch, SetStateAction } from "react";

export type ElevatorImagesModalType = "leftWall" | "rightWall" | "leftDoor" | "rightDoor" | "buttonPanel";

export default function ElevatorImagesModal({ elevator, setElevatorData, type, onSave, onClose }: {
    elevator: LiftJson;
    type?: ElevatorImagesModalType | null;
    setElevatorData?: Dispatch<SetStateAction<LiftJson>>;
    onSave?: () => void;
    onClose?: () => void;
}) {

    const info = {
        leftWall: {
            top: 100,
            left: 700,
            title: "Левая стена лифта",
        },
        rightWall: {
            top: 0,
            left: 0,
            title: "Правая стена лифта",
        },
        leftDoor: {
            top: 0,
            left: 0,
            title: "Левая дверь лифта",
        },
        rightDoor: {
            top: 0,
            left: 0,
            title: "Правая дверь лифта",
        },
        buttonPanel: {
            top: 100,
            left: 400,
            title: "Кнопочная панель лифта",
        },
    };

    const updateImageData = (type?: ElevatorImagesModalType | null, file?: File) => {
        if (!type || !file) return;
        const imageData = { ...elevator.elevator.images };
        if (type === 'buttonPanel') imageData.panel.url = URL.createObjectURL(file);

        setElevatorData?.({
            ...elevator,
            elevator: {
                ...elevator.elevator,
                images: imageData,
            }
        })
    }


    if (type) return (
        <div className="elevator-images-modal__overlay">
            <div className="elevator-images-modal" style={{ top: `${info[type].top}px`, left: `${info[type].left}px` }}>
                <div className="elevator-images-modal__header">
                    <h1>{info[type].title}</h1>
                </div>
                <section className="elevator-images-modal__section image-section">
                    <div className="elevator-images-modal__left">

                    </div>
                    <div className="elevator-images-modal__right">
                        <FileUploader
                            btnClass="elevator-images-modal__button upload-image-button"
                            label={{
                                upload: "Загрузить изображение...",
                                replace: "Заменить изображение..."
                            }}
                            accept="image/*"
                            onUpload={(e) => updateImageData(type, e.target.files?.[0])}

                        />
                    </div>
                </section>
                <section className="elevator-images-modal__section style-section">

                </section>
                <div className="elevator-images-modal__buttons">
                    <button className="elevator-images-modal__button modal-button save-button" onClick={onSave}>Сохранить изменения</button>
                    <button className="elevator-images-modal__button modal-button close-button" onClick={onClose}>Отменить изменения</button>
                </div>
            </div>
        </div>
    );
}