import { CategoryDefinition } from "@/constants/elevatorPanel";
import "./MyLiftEditorModal.css";
import { ElevatorDisplayConfig, ElevatorDoorOpenDirections, ElevatorDoorTypes, Floor, LiftJson } from "@/types/elevator";
import { ChangeEvent, useEffect, useState } from "react";
import { AccessCondition, FloorConfig } from "@/types/data/FloorTypes";
import { VideoData } from "@/types/data/VideoData";
import { VideoSettingsModalProps } from "@/types/components/VideoSettingsModal/VideoSettingsModal";
import FloorSelector from "@/components/ElevatorVideoPlayer/FloorSelector/FloorSelector";
import ModalWrapper from "@/components/ModalWrapper/ModalWrapper";
import VideoSettingsModal from "@/components/VideoSettingsModal/VideoSettingsModal";
import FileUploader from "@/components/FileUploader/FileUploader";
import { EVPMovementSoundEffects, EVPSoundEffects } from "@/types/data/ElevatorVideoPlayer/ElevatorVideoPlayer";
import DoorAnimationModal, { DoorAnimationModalProps } from "@/components/ElevatorVideoPlayer/DoorAnimationModal/DoorAnimationModal";
import LiftMotionModal from "@/components/ElevatorVideoPlayer/LiftMotionModal/LiftMotionModal";
import ElevatorDisplay from "@/components/ElevatorVideoPlayer/ElevatorDisplay/ElevatorDisplay";
import DisplayOptionsModal from "@/components/ElevatorVideoPlayer/DisplayOptionsModal/DisplayOptionsModal";

export default function MyLiftEditorModal({ activeCondition, category, elevator, onSave }: {
    activeCondition?: boolean;
    category: CategoryDefinition | null;
    elevator: LiftJson;
    onSave: (newData: LiftJson) => any
}) {
    const [openedModal, setOpenedModal] = useState<{
        modal: "VideoSettingsModal",
        props: VideoSettingsModalProps
    } | {
        modal: "DoorAnimationModal" | "LiftMotionModal",
        props: DoorAnimationModalProps,
    } | {
        modal: "DisplayOptionsModal",
    } | null>(null);
    const [liftData, setLiftData] = useState<LiftJson>(elevator);
    const [editingSoundEffects, setEditingSoundEffects] = useState<EVPSoundEffects>();

    const initSoundEffects = () => setEditingSoundEffects({
        buttonClick: (typeof liftData.elevator.soundEffects.buttonClick === 'string') ? liftData.elevator.soundEffects.buttonClick : undefined,
        doorOpen: (typeof liftData.elevator.soundEffects.doorOpen === 'string') ? liftData.elevator.soundEffects.doorOpen : undefined,
        doorClose: (typeof liftData.elevator.soundEffects.doorClose === 'string') ? liftData.elevator.soundEffects.doorClose : undefined,
        movement: {
            start: (typeof liftData.elevator.soundEffects.movement.start === 'string') ? liftData.elevator.soundEffects.movement.start : undefined,
            move: (typeof liftData.elevator.soundEffects.movement.move === 'string') ? liftData.elevator.soundEffects.movement.move : undefined,
            end: (typeof liftData.elevator.soundEffects.movement.end === 'string') ? liftData.elevator.soundEffects.movement.end : undefined,
        }
    });

    /* !!! РАБОТАЕТ, НО ТРЕБУЕТ ДОРАБОТКИ И ОПТИМИЗАЦИИ, чтобы код был красивее и архитектурно грамотнее !!! */

    const addFloor = () => {
        const newFloor: Floor = {
            // floorNumber: (floors.length + 1),
            id: String(liftData.floors.length + 1),
            displaySymbol: String(liftData.floors.length + 1),
            accessCondition: { type: 'free' },
            videoData: {
                title: '',
                url: '',
            }, // No video
        };
        setLiftData({
            ...liftData,
            floors: [...liftData.floors, newFloor],
        });
    }
    const updateFloor = (prop: string, value: any, index: number) => {
        setLiftData({
            ...liftData,
            floors: liftData.floors.map((floor, idx) => idx === index ? {
                ...floor,
                [prop]: value,
            } : floor),
        })
        // setFloors(prevFloors => prevFloors.map((floor, idx) => idx === index ? {
        //     ...floor,
        //     [prop]: value,
        // } : floor));
    }

    const updateAccessCondition = (floorIdx: number, value: Partial<AccessCondition>) => {
        const current = liftData.floors[floorIdx].accessCondition;
        updateFloor('accessCondition', {
            ...current,
            ...value,
        }, floorIdx);
    }

    const updateVideoData = (floorIdx: number, value: Partial<VideoData>) => {
        const current = liftData.floors[floorIdx].videoData;
        // alert(JSON.stringify(current, null, 3));
        updateFloor('videoData', {
            ...current,
            ...value,
        }, floorIdx);
        setOpenedModal({
            modal: "VideoSettingsModal",
            props: {
                floor: liftData.floors[floorIdx],
                idx: floorIdx,
                updateVideoData,
                onClose: () => setOpenedModal(null),
            }
        });
    }

    const removeFloor = (floorIdx: number) => {
        if (liftData.floors.length > 1) setLiftData(prev => ({
            ...prev,
            floors: prev.floors.filter((floor, idx) => idx !== floorIdx && floor)
        }));
    }

    const openVideoSettingsModal = (props: VideoSettingsModalProps) => {
        setOpenedModal({
            modal: "VideoSettingsModal",
            props,
        });
    }


    const uploadSoundFile = (e: ChangeEvent<HTMLInputElement>, categoryOrSound: string, subcategory?: keyof EVPMovementSoundEffects) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // alert(file instanceof File);
        if (categoryOrSound === 'movement' && subcategory) updateSoundEffects(categoryOrSound, {
            [subcategory]: file
        }); else updateSoundEffects(categoryOrSound, file);
    }

    const updateSoundEffects = (property: string, data: File | Partial<EVPMovementSoundEffects>) => {
        if (data instanceof File) {
            setLiftData(prev => ({
                ...prev,
                elevator: {
                    ...prev.elevator,
                    soundEffects: {
                        ...prev.elevator.soundEffects,
                        [property]: data,
                    }
                }
            }));
        } else if (property === 'movement') {
            setLiftData({
                ...liftData,
                elevator: {
                    ...liftData.elevator,
                    soundEffects: {
                        ...liftData.elevator.soundEffects,
                        movement: {
                            ...liftData.elevator.soundEffects.movement,
                            ...data as Record<string, string | null>,
                        },
                    }
                }
            });
        }


    }

    /* ******************************************************* */

    const getLiftPropValueByPath = (path?: string[]) => {
        let result = null;
        let obj: LiftJson | Record<string, any> | string = liftData;

        path?.forEach(value => {
            if (typeof obj !== 'string') obj = obj[value as keyof LiftJson];
            if (typeof obj === 'string') {
                result = obj;
            }
        });
        return result;
    }

    const setLiftPropValueByPath = (path: string[], value: any) => {
        let result = {
            ...liftData,
        };
        let obj: LiftJson | Record<string, any> = liftData;
        path.forEach(prop => {
            if (typeof obj[prop as keyof LiftJson] === 'string') {
                obj[prop as keyof LiftJson] = value;
            } else {
                obj = obj[prop as keyof LiftJson];
            }
        });
        setLiftData({
            ...result,
            ...obj,
        });
    }

    const saveLiftJson = async () => {
        try {
            const formData = new FormData();
            formData.append("updated_lift_json", JSON.stringify(liftData));
            liftData.floors.forEach((floor, idx) => {
                if (floor.videoData?.image instanceof File) {
                    formData.append(`image_floor_${idx}`, floor.videoData.image, floor.videoData.image.name);
                }
            });
            if (editingSoundEffects) for (const key in editingSoundEffects) {
                if (key === 'movement') {
                    if (editingSoundEffects.movement?.start instanceof File) formData.append(`sound_moveStart`, editingSoundEffects.movement?.start);
                    if (editingSoundEffects.movement?.move instanceof File) formData.append(`sound_moveLoop`, editingSoundEffects.movement?.move);
                    if (editingSoundEffects.movement?.end instanceof File) formData.append(`sound_moveEnd`, editingSoundEffects.movement?.end);
                } else {
                    const value = editingSoundEffects[key as keyof EVPSoundEffects];
                    if (value instanceof File) formData.append(`sound_${key}`, value);
                }
            }

            const res = await fetch(`/api/elevators/${elevator.id}`, {
                method: "PUT",
                body: formData,
            });

            const data: { success: boolean; lift: LiftJson } = await res.json();

            if (data.success) {
                setLiftData(data.lift);
                onSave?.(data.lift);
            }
        } catch (error) {

        }
    }

    const onSaveDisplayData = (updated: ElevatorDisplayConfig) => {
        setLiftData({
            ...liftData,
            elevator: {
                ...liftData.elevator,
                display: updated,
            }
        });
        setOpenedModal(null);
    }

    useEffect(() => {
        setLiftData(elevator);
        // alert(elevator.elevator.soundEffects.doorOpen);
        initSoundEffects();
    }, [elevator]);

    if (activeCondition && category && liftData) return (
        <div className="mylift-editor-modal__overlay">
            <div className="mylift-editor-modal">
                <div className="mylift-editor-modal__header">
                    <h1 className="mylift-editor-modal__title">{category.label}</h1>
                </div>
                <div className="mylift-editor-modal__content">
                    {category.id === 'main' ? (
                        <>
                            <section className="mylift-editor-modal__section">
                                <h2 className="mylift-editor-modal__subtitle">Название и описание</h2>
                                <div className="mylift-editor-modal__property">
                                    <span className="mylift-editor-modal__label">Название:</span>
                                    <input
                                        type="text"
                                        className="mylift-editor-modal__input"
                                        value={liftData.title}
                                        onChange={(e) => setLiftData({
                                            ...liftData,
                                            title: e.target.value,
                                        })}
                                    />
                                </div>
                                <div className="mylift-editor-modal__property">
                                    <span className="mylift-editor-modal__label">Описание:</span>
                                    <textarea
                                        className="mylift-editor-modal__input"
                                        value={liftData.description}
                                        onChange={(e) => setLiftData({
                                            ...liftData,
                                            description: e.target.value
                                        })}
                                    ></textarea>
                                </div>
                            </section>
                            <section className="mylift-editor-modal__section">
                                <h2 className="mylift-editor-modal__subtitle">Этажи и видео</h2>
                                <FloorSelector
                                    floorList={liftData.floors}
                                    updateFloor={updateFloor}
                                    updateAccessCondition={updateAccessCondition}
                                    updateVideoData={updateVideoData}
                                    removeFloor={removeFloor}
                                    openVideoSettingsModal={openVideoSettingsModal}
                                    closeVideoSettingsModal={() => setOpenedModal(null)}
                                />
                            </section>
                            <section className="mylift-editor-modal__section">
                                <h2 className="mylift-editor-modal__subtitle">Звуковые эффекты</h2>
                                <div className="mylift-editor-modal__property">
                                    <span>Открытие дверей ::</span>
                                    {(editingSoundEffects?.doorOpen instanceof File) ? <></> : <span className="mylift-editor-modal__label">{editingSoundEffects?.doorOpen?.replace(/\/.*(?=\/)./g, '')}</span>}
                                    <FileUploader
                                        btnClass="mylift-editor-modal__button upload-sound-button"
                                        label="Загрузить аудиофайл..."
                                        onUpload={(e) => setEditingSoundEffects({
                                            ...editingSoundEffects,
                                            doorOpen: e.target.files?.[0]
                                        })}
                                        file={editingSoundEffects?.doorOpen || undefined}
                                        msgClass="mylift-editor-modal__message uploaded-sound-name"
                                        accept="audio/*"
                                    />
                                </div>
                                <div className="mylift-editor-modal__property">
                                    <span>Закрытие дверей ::</span>
                                    {(editingSoundEffects?.doorClose instanceof File) ? <></> : <span className="mylift-editor-modal__label">{editingSoundEffects?.doorClose?.replace(/\/.*(?=\/)./g, '')}</span>}
                                    <FileUploader
                                        btnClass="mylift-editor-modal__button upload-sound-button"
                                        label="Загрузить аудиофайл..."
                                        onUpload={(e) => setEditingSoundEffects({
                                            ...editingSoundEffects,
                                            doorClose: e.target.files?.[0]
                                        })}
                                        file={editingSoundEffects?.doorClose || undefined}
                                        msgClass="mylift-editor-modal__message uploaded-sound-name"
                                        accept="audio/*"
                                    />
                                </div>
                                <div className="mylift-editor-modal__property">
                                    <span>Нажатие на кнопку ::</span>
                                    {(editingSoundEffects?.buttonClick instanceof File) ? <></> : <span className="mylift-editor-modal__label">{editingSoundEffects?.buttonClick?.replace(/\/.*(?=\/)./g, '')}</span>}
                                    <FileUploader
                                        btnClass="mylift-editor-modal__button upload-sound-button"
                                        label="Загрузить аудиофайл..."
                                        onUpload={(e) => setEditingSoundEffects({
                                            ...editingSoundEffects,
                                            buttonClick: e.target.files?.[0]
                                        })}
                                        file={editingSoundEffects?.buttonClick || undefined}
                                        msgClass="mylift-editor-modal__message uploaded-sound-name"
                                        accept="audio/*"
                                    />
                                </div>
                                <div className="mylift-editor-modal__property">
                                    <span>Начало движения лифта ::</span>
                                    {(editingSoundEffects?.movement?.start instanceof File) ? <></> : <span className="mylift-editor-modal__label">{editingSoundEffects?.movement?.start?.replace(/\/.*(?=\/)./g, '')}</span>}
                                    <FileUploader
                                        btnClass="mylift-editor-modal__button upload-sound-button"
                                        label="Загрузить аудиофайл..."
                                        onUpload={(e) => setEditingSoundEffects({
                                            ...editingSoundEffects,
                                            movement: {
                                                start: e.target.files?.[0]
                                            }
                                        })}
                                        file={editingSoundEffects?.movement?.start || undefined}
                                        msgClass="mylift-editor-modal__message uploaded-sound-name"
                                        accept="audio/*"
                                    />
                                </div>
                                <div className="mylift-editor-modal__property">
                                    <span>Движение лифта ::</span>
                                    {(editingSoundEffects?.movement?.move instanceof File) ? <></> : <span className="mylift-editor-modal__label">{editingSoundEffects?.movement?.move?.replace(/\/.*(?=\/)./g, '')}</span>}
                                    <FileUploader
                                        btnClass="mylift-editor-modal__button upload-sound-button"
                                        label="Загрузить аудиофайл..."
                                        onUpload={(e) => setEditingSoundEffects({
                                            ...editingSoundEffects,
                                            movement: {
                                                move: e.target.files?.[0]
                                            }
                                        })}
                                        file={editingSoundEffects?.movement?.move || undefined}
                                        msgClass="mylift-editor-modal__message uploaded-sound-name"
                                        accept="audio/*"
                                    />
                                </div>
                                <div className="mylift-editor-modal__property">
                                    <span>Остановка лифта ::</span>
                                    {(editingSoundEffects?.movement?.end instanceof File) ? <></> : <span className="mylift-editor-modal__label">{editingSoundEffects?.movement?.end?.replace(/\/.*(?=\/)./g, '')}</span>}
                                    <FileUploader
                                        btnClass="mylift-editor-modal__button upload-sound-button"
                                        label="Загрузить аудиофайл..."
                                        onUpload={(e) => setEditingSoundEffects({
                                            ...editingSoundEffects,
                                            movement: {
                                                end: e.target.files?.[0]
                                            }
                                        })}
                                        file={editingSoundEffects?.movement?.end || undefined}
                                        msgClass="mylift-editor-modal__message uploaded-sound-name"
                                        accept="audio/*"
                                    />
                                </div>
                            </section>
                        </>
                    ) : category.id === 'elevator' ? (
                        <>
                            <section className="mylift-editor-modal__section">
                                <h2 className="mylift-editor-modal__subtitle">Внешний вид</h2>
                            </section>
                            <section className="mylift-editor-modal__section">
                                <h2 className="mylift-editor-modal__subtitle">Кнопочная панель</h2>
                                <div className="mylift-editor-modal__property">
                                    <span className="mylift-editor-modal__label">Табло индикации:</span>
                                    <button
                                        className="mylift-editor-modal__button display-button"
                                        onClick={() => setOpenedModal({
                                            modal: "DisplayOptionsModal",
                                        })}
                                    >
                                        <span className="mylift-editor-modal__label">{liftData.elevator.display.type}</span>
                                        <ElevatorDisplay
                                            type={liftData.elevator.display.type}
                                            floor={1}
                                            direction="NONE"
                                            styles={{
                                                width: '130px',
                                                scale: 0.5,
                                                cursor: 'pointer'
                                            }}
                                        />
                                    </button>
                                </div>
                            </section>
                            <section className="mylift-editor-modal__section">
                                <h2 className="mylift-editor-modal__subtitle">Двери лифта</h2>
                                <div className="mylift-editor-modal__property">
                                    <span className="mylift-editor-modal__label">Тип дверей:</span>
                                    <select
                                        className="mylift-editor-modal__input door-type-select"
                                        value={liftData.elevator.doorConfig.type}
                                        onChange={(e) => {
                                            const newData: Record<string, any> = {
                                                type: (e.target.value as ElevatorDoorTypes),
                                            };
                                            if (e.target.value === 'central') {
                                                newData.direction = null;
                                            }
                                            setLiftData({
                                                ...liftData,
                                                elevator: {
                                                    ...liftData.elevator,
                                                    doorConfig: {
                                                        ...liftData.elevator.doorConfig,
                                                        ...newData,
                                                    }
                                                }
                                            });
                                        }}
                                    >
                                        <option value="central">Центрального открывания</option>
                                        <option value="telescopic">Телескопические</option>
                                        <option value="single">Одна створка</option>
                                    </select>
                                </div>
                                {liftData.elevator.doorConfig.type !== 'central' ? (
                                    <div className="mylift-editor-modal__property">
                                        <span className="mylift-editor-modal__label">Направление открытия:</span>
                                        <select
                                            className="mylift-editor-modal__input door-direction-select"
                                            value={liftData.elevator.doorConfig.direction || "left"}
                                            onChange={(e) => setLiftData({
                                                ...liftData,
                                                elevator: {
                                                    ...liftData.elevator,
                                                    doorConfig: {
                                                        ...liftData.elevator.doorConfig,
                                                        direction: (e.target.value as ElevatorDoorOpenDirections),
                                                    }
                                                }
                                            })}
                                        >
                                            <option value="left">←</option>
                                            <option value="right">→</option>
                                        </select>
                                    </div>
                                ) : <></>}
                                <div className="mylift-editor-modal__property">
                                    <span className="mylift-editor-modal__label">Анимация открытия/закрытия:</span>
                                    <button
                                        className="mylift-editor-modal__button door-anim-editor"
                                        onClick={() => setOpenedModal({
                                            modal: "DoorAnimationModal",
                                            props: {
                                                elevator: liftData,
                                                updateElevatorData: setLiftData,
                                                onClose: () => setOpenedModal(null),
                                            }
                                        })}
                                    >Открыть редактор анимации</button>
                                </div>
                            </section>
                            <section className="mylift-editor-modal__section">
                                <h2 className="mylift-editor-modal__subtitle">Движение лифта</h2>
                                <div className="mylift-editor-modal__property">
                                    <button
                                        className="mylift-editor-modal__button movement-editor-btn"
                                        onClick={() => setOpenedModal({
                                            modal: "LiftMotionModal",
                                            props: {
                                                elevator: liftData,
                                                updateElevatorData: setLiftData,
                                                onClose: () => setOpenedModal(null),
                                            }
                                        })}
                                    >Открыть редактор движения лифта</button>
                                </div>
                            </section>
                        </>
                    ) : category.id === 'coursebot' ? (
                        <section className="mylift-editor-modal__section">
                            <div className="mylift-editor-modal__property">
                                <span className="mylift-editor-modal__label">Включен Уровнебот:</span>
                                <input
                                    type="checkbox"
                                    checked={liftData.coursebot.enabled}
                                    disabled
                                />
                            </div>
                            {liftData.coursebot.enabled ? (
                                <section className="mylift-editor-modal__section">
                                    <h2 className="mylift-editor-modal__subtitle">Автосохранение</h2>
                                    <div className="mylift-editor-modal__property">
                                        <span className="mylift-editor-modal__label">Время после паузы перед автосохранением:</span>
                                        <input
                                            type="number"
                                            className="mylift-editor-modal__input coursebot-autosave-time"
                                            min={0}
                                            max={60}
                                            value={liftData.coursebot.autosaveDelaySec || 30}
                                            onChange={(e) => setLiftData({
                                                ...liftData,
                                                coursebot: {
                                                    ...liftData.coursebot,
                                                    autosaveDelaySec: Number(e.target.value)
                                                }
                                            })}
                                        />
                                    </div>
                                    <div className="mylift-editor-modal__property">
                                        <span className="mylift-editor-modal__label">Скрытое автосохранение:</span>
                                        <input
                                            type="checkbox"
                                            checked={liftData.coursebot.hiddenAutosave || false}
                                            onChange={(e) => setLiftData({
                                                ...liftData,
                                                coursebot: {
                                                    ...liftData.coursebot,
                                                    hiddenAutosave: e.target.checked,
                                                }
                                            })}
                                        />
                                    </div>
                                </section>
                            ) : <></>}
                        </section>
                    ) : (<></>)}
                </div>
                <div className="mylift-editor-modal__buttons">
                    <button className="mylift-editor-modal__button save-button" onClick={saveLiftJson}>Сохранить настройки</button>
                </div>
            </div>
            <ModalWrapper>
                {(openedModal?.modal === "VideoSettingsModal") ? <VideoSettingsModal
                    floor={liftData.floors[openedModal.props.idx]}
                    idx={openedModal.props.idx}
                    updateVideoData={updateVideoData}
                    onClose={() => setOpenedModal(null)}
                /> : (openedModal?.modal === "DoorAnimationModal") ? (
                    <DoorAnimationModal
                        elevator={liftData}
                        onClose={() => setOpenedModal(null)}
                        updateElevatorData={setLiftData}
                    />
                ) : (openedModal?.modal === "LiftMotionModal") ? (
                    <LiftMotionModal
                        elevator={liftData}
                        onClose={() => setOpenedModal(null)}
                        updateElevatorData={setLiftData}
                    />
                ) : (openedModal?.modal === "DisplayOptionsModal") ? (
                    <DisplayOptionsModal
                        elevator={liftData}
                        display={liftData.elevator.display}
                        onSave={onSaveDisplayData}
                        onClose={() => setOpenedModal(null)}
                    />
                ) : <></>}

            </ModalWrapper>
        </div>
    );

    // if (activeCondition && category && liftData) return (
    //     <div className="mylift-editor-modal__overlay">
    //         <div className="mylift-editor-modal">
    //             <div className="mylift-editor-modal__header">
    //                 <h1 className="mylift-editor-modal__title">{category.label}</h1>
    //             </div>
    //             <div className="mylift-editor-modal__content">
    //                 {category.sections?.map((section, idx) => (
    //                     <section className="mylift-editor-modal__section">
    //                         <h2 className="mylift-editor-modal__subtitle">{section.label}</h2>
    //                         {section.options.map((opt, i) => {
    //                             let props = opt.property?.split('>');
    //                             const value = getLiftPropValueByPath(props);
    //                             if (opt.type === 'string') return (
    //                                 <div className="mylift-editor-modal__property">
    //                                     <span className="mylift-editor-modal__label">{opt.label}:</span>
    //                                     <input
    //                                         type="text"
    //                                         className="mylift-editor-modal__input"
    //                                         value={value || ""}
    //                                         onChange={(e) => setLiftPropValueByPath(props || [], e.target.value)}
    //                                     />
    //                                 </div>
    //                             );

    //                             if (opt.type === 'floorSelector') return (
    //                                 <FloorSelector
    //                                     floorList={liftData.floors}
    //                                     updateFloor={updateFloor}
    //                                     updateAccessCondition={updateAccessCondition}
    //                                     updateVideoData={updateVideoData}
    //                                     removeFloor={removeFloor}
    //                                     openVideoSettingsModal={openVideoSettingsModal}
    //                                     closeVideoSettingsModal={() => setOpenedModal(null)}
    //                                 />
    //                             );

    //                             if (opt.type === 'fileUploader') return (
    //                                 <div className="mylift-editor-modal__property">
    //                                     <span className="mylift-editor-modal__label">{opt.label} :: </span>
    //                                     <FileUploader
    //                                         btnClass="mylift-editor-modal__button upload-sound-button"
    //                                         label={opt.fileUploaderData?.label}
    //                                         onUpload={(e) => uploadSoundFile(e, "movement", "move")}
    //                                         file={value || undefined}
    //                                         msgClass="mylift-editor-modal__message uploaded-sound-name"
    //                                         accept={opt.fileUploaderData?.accept}
    //                                     />
    //                                 </div>
    //                             )
    //                         })}
    //                     </section>
    //                 )
    //                 )}
    //             </div>
    //         </div>
    //         <ModalWrapper>
    //             {openedModal && <VideoSettingsModal
    //                 floor={liftData.floors[openedModal.idx]}
    //                 idx={openedModal.idx}
    //                 updateVideoData={updateVideoData}
    //                 onClose={() => setOpenedModal(null)}
    //             />}
    //         </ModalWrapper>
    //     </div>
    // );
}