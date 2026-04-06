import { LiftJson } from "@/types/elevator";
import "./ElevatorImagesModal.css";
import FileUploader from "@/components/FileUploader/FileUploader";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export type ElevatorImagesModalType = "leftWall" | "rightWall" | "leftDoor" | "rightDoor" | "buttonPanel";


export default function ElevatorImagesModal({ elevator, setElevatorData, type, onSave, onClose }: {
    elevator: LiftJson;
    type?: ElevatorImagesModalType | null;
    setElevatorData?: Dispatch<SetStateAction<LiftJson>>;
    onSave?: (uploaded: Record<ElevatorImagesModalType, File | null>) => void;
    onClose?: () => void;
}) {

    const [oldImageData, setOldImageData] = useState(() =>
        structuredClone(elevator.elevator.images)
    );

    useEffect(() => {
        if (type) {
            setOldImageData(structuredClone(elevator.elevator.images));
        }
    }, [type]);

    const info = {
        leftWall: {
            top: 100,
            left: 700,
            title: "Левая стена лифта",
        },
        rightWall: {
            top: 100,
            left: 150,
            title: "Правая стена лифта",
        },
        leftDoor: {
            top: 100,
            left: 850,
            title: "Левая дверь лифта",
        },
        rightDoor: {
            top: 100,
            left: 30,
            title: "Правая дверь лифта",
        },
        buttonPanel: {
            top: 100,
            left: 400,
            title: "Кнопочная панель лифта",
        },
    };

    const [uploadedFiles, setUploadedFiles] = useState({
        leftDoor: null as (File | null),
        rightDoor: null as (File | null),
        leftWall: null as (File | null),
        rightWall: null as (File | null),
        buttonPanel: null as (File | null),
    });

    const updateImageData = (type?: ElevatorImagesModalType | null, file?: File) => {
        if (!type || !file) return;

        const imageData = structuredClone(elevator.elevator.images);
        const newUrl = URL.createObjectURL(file);

        setUploadedFiles(prev => ({ ...prev, [type]: file }));

        if (type === 'buttonPanel') imageData.panel.url = newUrl;
        if (type === 'leftDoor') imageData.doors.left.url = newUrl;
        if (type === 'rightDoor') imageData.doors.right.url = newUrl;
        if (type === 'leftWall') imageData.walls.left.url = newUrl;
        if (type === 'rightWall') imageData.walls.right.url = newUrl;

        setElevatorData?.({
            ...elevator,
            elevator: {
                ...elevator.elevator,
                images: imageData,
            }
        });
    };

    const path = type ? (
        (type === 'buttonPanel') ? elevator.elevator.images.panel :
            (type === 'leftDoor') ? elevator.elevator.images.doors.left :
                (type === 'rightDoor') ? elevator.elevator.images.doors.right :
                    (type === 'leftWall') ? elevator.elevator.images.walls.left :
                        elevator.elevator.images.walls.right
    ).url : null;

    const fileName = path ? path.split('/').pop() : null;


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
                        {(fileName && !uploadedFiles[type]) && <span className="elevator-images-modal__label uploaded-file-name">{fileName}</span>}
                        <FileUploader
                            btnClass="elevator-images-modal__button upload-image-button"
                            msgClass="elevator-images-modal__label uploaded-file-name"
                            label={{
                                upload: (fileName && !uploadedFiles[type]) ? "Заменить изображение..." : "Загрузить изображение...",
                                replace: "Заменить изображение..."
                            }}
                            file={uploadedFiles[type] || undefined}
                            accept="image/*"
                            onUpload={(e) => updateImageData(type, e.target.files?.[0])}

                        />
                    </div>
                </section>
                <section className="elevator-images-modal__section style-section">

                </section>
                <div className="elevator-images-modal__buttons">
                    <button className="elevator-images-modal__button modal-button save-button" onClick={() => onSave?.(uploadedFiles)}>Сохранить изменения</button>
                    <button className="elevator-images-modal__button modal-button close-button" onClick={() => {
                        setElevatorData?.({
                            ...elevator,
                            elevator: {
                                ...elevator.elevator,
                                images: oldImageData,
                            }
                        });
                        setUploadedFiles({
                            leftDoor: null as (File | null),
                            rightDoor: null as (File | null),
                            leftWall: null as (File | null),
                            rightWall: null as (File | null),
                            buttonPanel: null as (File | null),
                        });
                        // alert(JSON.stringify(oldImageData));
                        onClose?.();
                    }}>Отменить изменения</button>
                </div>
            </div>
        </div>
    );
}