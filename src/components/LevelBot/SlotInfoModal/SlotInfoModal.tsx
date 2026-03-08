import { SlotData } from "@/types/elevator";
import { LevelBotModalProps } from "../LevelBotModal";
import "./SlotInfoModal.css";
import { useEffect, useState } from "react";

export default function SlotInfoModal({ mode, slotData, onClose }: {
    mode: LevelBotModalProps['mode'], slotData?: {
        isAutosave: boolean,
        data?: SlotData
    } | null, onClose?: () => void
}) {
    const [data, setData] = useState(slotData);
    const titleMessage =
        (data?.isAutosave) ? "Автосохранение" :
            (!data?.data?.empty && data?.data?.title) ? data?.data?.title : "Нет данных";

    useEffect(() => {
        if (slotData !== null) setData(slotData);
    }, [slotData]);

    return (
        <div className={`slot-info-modal ${slotData === null ? 'closed' : 'opened'}`}>
            <div className={
                `slot-info-modal__top 
                ${(!data?.isAutosave && data?.data?.empty) ? "empty-slot " : ""}
                ${(data?.isAutosave) ? "autosave-slot" : ""} 
                ${(!data?.isAutosave && !data?.data?.empty) ? "slot-with-data" : ""}
                `
            }>
                <div className="slot-info-modal__top-left">
                    <h1 className="slot-info-modal__title">{titleMessage}</h1>
                </div>
                <div className="slot-info-modal__top-right">
                    <button className="slot-info-modal__button close-button" onClick={() => onClose?.()}>⨉</button>
                </div>
            </div>
            {(!data?.data) ? (
                <>
                    <div className="slot-info-modal__main">
                        <div className="slot-info-modal__main-left">
                            <div className="slot-info-modal__preview">
                                {data?.data?.thumbnailUrl && (
                                    <img src={data.data.thumbnailUrl} />
                                )}
                                <div className="slot-info-modal__metadata">
                                    <span className="slot-info-modal__label metadata-createdAt">08.03.2026</span>
                                    <span className="slot-info-modal__label metadata-currentTime">1:53:06</span>
                                </div>
                            </div>
                        </div>
                        <div className="slot-info-modal__main-right">

                        </div>
                    </div>
                    {data?.isAutosave ? (
                        <div className="slot-info-modal__buttons autosave-slot">
                            <div className="slot-info-modal__button-group">
                                <button className="slot-info-modal__button mylift-player-button">Открыть в <span className="mylift">MyLift Player</span></button>
                                <button className="slot-info-modal__button coursebot-player-button">Открыть в Coursebot Player</button>
                            </div>
                            <button className="slot-info-modal__button clear-autosave-button">Очистить Автосохранение</button>
                        </div>
                    ) : (
                        <div className="slot-info-modal__buttons">
                            <button className="slot-info-modal__button mylift-player-button">Открыть в <span className="mylift">MyLift Player</span></button>
                            <button className="slot-info-modal__button coursebot-player-button">Открыть в Coursebot Player</button>
                        </div>
                    )}
                </>
            ) : (
                <span className="slot-info-modal__notification empty-slot-notification">
                    <span className="slot-info-modal__label">Выбранный слот ещё не заполнен!</span>
                    <button className="slot-info-modal__button mylift-player-button">Перейти в <span className="mylift">MyLift Player</span></button>
                </span>
            )}
        </div>
    );
}