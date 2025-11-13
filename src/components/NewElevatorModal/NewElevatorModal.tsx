'use client';
import { useState } from "react";
import "./NewElevatorModal.css";
import { AccessCondition, FloorConfig } from "@/types/data/FloorTypes";
import ModalWrapper from "../ModalWrapper/ModalWrapper";
import VideoSettingsModal from "../VideoSettingsModal/VideoSettingsModal";
import { VideoSettingsModalProps } from "@/types/components/VideoSettingsModal/VideoSettingsModal";
import { VideoData } from "@/types/data/VideoData";
export default function NewElevatorModal() {
    const [openedModal, setOpenedModal] = useState<VideoSettingsModalProps | null>(null);
    const [floors, setFloors] = useState<FloorConfig[]>([]);
    const addFloor = () => {
        const newFloor: FloorConfig = {
            floorNumber: (floors.length + 1),
            displaySymbol: String(floors.length + 1),
            accessCondition: { type: 'free' },
            videoData: {
                title: '',
                url: '',
            }, // No video
        };
        setFloors([...floors, newFloor]);
    }
    const updateFloor = (prop: string, value: any, index: number) => {
        setFloors(prevFloors => prevFloors.map((floor, idx) => idx === index ? {
            ...floor,
            [prop]: value,
        } : floor));
    }

    const updateAccessCondition = (floorIdx: number, value: Partial<AccessCondition>) => {
        const current = floors[floorIdx].accessCondition;
        updateFloor('accessCondition', {
            ...current,
            ...value,
        }, floorIdx);
    }

    const updateVideoData = (floorIdx: number, value: Partial<VideoData>) => {
        const current = floors[floorIdx].videoData;
        // alert(JSON.stringify(current, null, 3));
        updateFloor('videoData', {
            ...current,
            ...value,
        }, floorIdx);
        setOpenedModal({
            floor: floors[floorIdx],
            idx: floorIdx,
            updateVideoData,
            onClose: () => setOpenedModal(null),
        });
    }

    const openVideoSettingsModal = (props: VideoSettingsModalProps) => {
        setOpenedModal(props);
    }

    return (
        <div className="new-elevator-modal">
            <div className="new-elevator-modal__container">
                <h1 className="new-elevator-modal__title">Новый Лифт</h1>
                <div className="new-elevator-modal__content">
                    <div className="new-elevator-modal__item">
                        <span className="new-elevator-modal__label">Название и описание</span>
                        <div className="new-elevator-modal__item-content">
                            <div className="new-elevator-modal__block">
                                <span className="new-elevator-modal__text">Название:</span>
                                <input type="text" className="new-elevator-modal__input name-description-input" />
                            </div>
                            <div className="new-elevator-modal__block">
                                <span className="new-elevator-modal__text">Описание:</span>
                                <textarea className="new-elevator-modal__input name-description-input"></textarea>
                            </div>
                        </div>
                    </div>
                    <div className="new-elevator-modal__item">
                        <span className="new-elevator-modal__label">Этажи лифта</span>
                        <div className="new-elevator-modal__item-content">
                            <div className="new-elevator-modal__block flex-col floor-list">
                                {floors.map((floor, idx) => (
                                    <div className="new-elevator-modal__floor-block" key={idx}>
                                        <div className="new-elevator-modal__floor-tile">{floor.floorNumber}F</div>
                                        <div className="new-elevator-modal__floor-tile">
                                            <span className="new-elevator-modal__floor-text">Отобразить как:</span>
                                            <input type="text" className="new-elevator-modal__input floor-symbol-input" onChange={(e) => updateFloor("displaySymbol", e.target.value, idx)} value={floor.displaySymbol} />
                                        </div>
                                        <div className="new-elevator-modal__floor-tile">
                                            <span className="new-elevator-modal__floor-text">Доступность:</span>
                                            <select
                                                className="new-elevator-modal__input floor-access-select"
                                                value={floor.accessCondition?.type || 'free'}
                                                onChange={(e) => updateFloor("accessCondition", { type: e.target.value }, idx)}
                                            >
                                                <option value="free">всегда</option>
                                                <option value="viewCount">после просмотра видео</option>
                                                <option value="blocked">заблокирован</option>
                                            </select>
                                            {floor.accessCondition?.type === 'viewCount' && (
                                                <>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={9}
                                                        className="new-elevator-modal__input floor-view-count-input"
                                                        value={floor.accessCondition?.requiredViews || 1}
                                                        onChange={(e) => updateAccessCondition(idx, { requiredViews: Number(e.target.value) })}

                                                    />
                                                    <span className="new-elevator-modal__text ml-1">раз{([2, 3, 4].includes(Number(floor.accessCondition?.requiredViews || 1))) && 'а'} на</span>
                                                    <select
                                                        className="new-elevator-modal__input floor-number-select"
                                                        value={floor.accessCondition?.floor}
                                                        onChange={(e) => updateAccessCondition(idx, { floor: Number(e.target.value) })}
                                                    >
                                                        {floors.map((floor, i) => (i !== idx) && <option key={i} value={floor.floorNumber}>{floor.floorNumber}F</option>)}
                                                    </select>

                                                </>
                                            )}
                                        </div>
                                        <div className="new-elevator-modal__floor-tile">
                                            <button
                                                className="new-elevator-modal__button floor-video-button"
                                                onClick={() => openVideoSettingsModal({
                                                    floor: floors[idx],
                                                    idx,
                                                    updateVideoData,
                                                    onClose: () => setOpenedModal(null),
                                                })}>
                                                Видео...
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="new-elevator-modal__block">
                                <button className="new-elevator-modal__button add-floor-button" onClick={addFloor}>+ Новый этаж</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ModalWrapper>
                {openedModal && <VideoSettingsModal
                    floor={floors[openedModal.idx]}
                    idx={openedModal.idx}
                    updateVideoData={updateVideoData}
                    onClose={() => setOpenedModal(null)}
                />}
            </ModalWrapper>
        </div>
    );
}