import { CommonSlotData, SlotData, VideoStats } from "@/types/elevator";
import { LevelBotMode, SavePayload } from "../LevelBotModal";
import "./SlotInfoModal.css";
import { MouseEvent, useEffect, useState } from "react";
import AudioController from "@/core/audio/AudioController";
import { MyLiftPlayerMode } from "@/components/MyLiftPlayer/MyLiftPlayer";

export interface EditingSlotData {
    title?: string;
}

export default function SlotInfoModal({
    mode,
    slotData,
    videoStats,
    savePayload,
    onClose,
    onSave,
    onDelete,
    onClearAutosave,
    onOverwrite,
    onEdit,
    onOpenInMyLiftPlayer,
    onOpenInCoursebotPlayer
}: {
    mode: LevelBotMode;
    videoStats?: VideoStats;
    slotData?: {
        isAutosave: boolean;
        index: number;
        data?: SlotData | null;
    } | null;
    savePayload?: SavePayload;
    onClose?: () => void;

    onSave?: (title: string) => void;
    onDelete?: () => void;
    onClearAutosave?: () => void;
    onOverwrite?: (title: string) => void;
    onEdit?: (data: EditingSlotData) => void;

    onOpenInMyLiftPlayer?: (mode?: MyLiftPlayerMode) => void;
    onOpenInCoursebotPlayer?: () => void;
}) {
    const [data, setData] = useState(slotData);
    const [titleInput, setTitleInput] = useState("");
    const [slotDataEditMode, setSlotDataEditMode] = useState<"title" | "delete" | null>(null);
    const [openCompletedWatchAutosave, setOpenCompletedWatchAutosave] = useState(false);

    const currentData = (data?.data?.isAutosave) ? data?.data.data.main : data?.data?.data as CommonSlotData;

    const isEmpty = currentData?.empty;
    const isAutosave = data?.isAutosave ?? false;

    useEffect(() => {
        setData(slotData);
        if (currentData?.title) setTitleInput(currentData.title);
    }, [slotData]);

    if (!data) {
        return (
            <div className="slot-info-modal closed"></div>
        );
    }

    const titleMessage =
        mode === "save" && isEmpty
            ? "Сохранить фрагмент"
            : isAutosave
                ? "Автосохранение"
                : (currentData?.title) || "Нет данных";

    const isReadOnly = mode === "load";
    const isEditMode = mode === "default";
    const isSaveMode = mode === "save";
    const isAutosaveMode = mode === "autosave";

    const formatTimecode = (input?: number) => {
        if (!input) return null;
        const hours = Math.floor(input / 3600);
        const minutes = Math.floor((input / 60) % 60);
        const seconds = Math.floor(input % 60);
        return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    const closeModal = () => {
        AudioController.playCoursebotSound("close", "/audio/sound/coursebot/coursebot-close-modal.wav");
        setSlotDataEditMode(null);
        onClose?.();
    }

    const openInMyLiftPlayer = (e: MouseEvent<HTMLButtonElement>, playerMode?: MyLiftPlayerMode) => {
        AudioController.playCoursebotSound("select", "/audio/sound/coursebot/coursebot-select-button.wav");
        // if (e.target instanceof HTMLButtonElement) e.target.style.scale = "1.1";
        setTimeout(() => {
            onOpenInMyLiftPlayer?.(playerMode);
        }, 400);
    }

    const openInCoursebotPlayer = (e: MouseEvent<HTMLButtonElement>) => {
        AudioController.playCoursebotSound("select", "/audio/sound/coursebot/coursebot-select-button.wav");
        // if (e.target instanceof HTMLButtonElement) e.target.style.scale = "1.1";
        setTimeout(() => {
            onOpenInCoursebotPlayer?.();
        }, 400);
    }

    const currentWatchInfo = (data.data?.isAutosave && data?.data?.data && data.data.data.playerState.watchInfo?.watchNumber) ? videoStats?.watchHistory?.[
        data.data.data.playerState.watchInfo.watchNumber - 1
    ] : undefined;

    // alert(JSON.stringify(videoStats))

    return (
        <div className={`slot-info-modal ${slotData ? "opened" : "closed"}`}>

            <div className={
                `slot-info-modal__top 
                ${isAutosave ? "autosave-slot" : ""}
                ${slotDataEditMode ? ` slot-data-edit-mode__${slotDataEditMode}` :
                    isEmpty && !isAutosave ? "empty-slot" : (isSaveMode && !isEmpty) ? "empty-slot" : "with-data"} 
                `
            }>
                <div className="slot-info-modal__top-left">
                    <h1 className="slot-info-modal__title">{titleMessage}</h1>
                </div>
                <div className="slot-info-modal__top-right">
                    {!isAutosaveMode && (
                        <button className="slot-info-modal__button close-button" onClick={closeModal}>⨉</button>
                    )}
                </div>
            </div>

            {isAutosaveMode && (
                <div className="slot-info-modal__autosave-animation">
                    <div className="slot-info-modal__autosave-text">Сохранение…</div>
                    <div className="slot-info-modal__autosave-bar"></div>
                </div>
            )}

            {((isEmpty && !isSaveMode && !isAutosaveMode) || isAutosave && !data.data) && (
                <div className="slot-info-modal__notification empty-slot-notification">
                    <span className="slot-info-modal__label">{
                        (isAutosave) ?
                            "Нет автосохранения! Данные появятся при просмотре видео на этаже!" :
                            "Выбранный слот ещё не заполнен!"
                    }</span>
                    {mode === "default" && (
                        <button
                            className="slot-info-modal__button mylift-player-button"
                            onClick={openInMyLiftPlayer}
                        >
                            Перейти в <span className="mylift">MyLift Player</span>
                        </button>
                    )}
                </div>
            )}


            {isSaveMode && isEmpty && (
                <div className="slot-info-modal__save-form">
                    <div className="slot-info-modal__preview">
                        {savePayload?.thumbnailUrl && (
                            <img src={savePayload.thumbnailUrl} />
                        )}
                        <div className="slot-info-modal__metadata">
                            <span className="slot-info-modal__label metadata-createdAt">
                                {savePayload?.createdAt ?? "??.??.????"}
                                {/* {data.data?.createdAt ?? "??.??.????"} */}
                            </span>
                            <span className="slot-info-modal__label metadata-currentTime">
                                {formatTimecode(savePayload?.timecode) ?? "0:00:00"}
                                {/* {data.data?.timecode ?? "0:00:00"} */}
                            </span>
                        </div>
                    </div>
                    <div className="slot-info-modal__block">
                        <span>Название:</span>
                        <input
                            className="slot-info-modal__input"
                            // placeholder="Название фрагмента"
                            value={titleInput}
                            onChange={(e) => setTitleInput(e.target.value)}
                        />
                    </div>
                    <button
                        className="slot-info-modal__button save-button"
                        onClick={() => {
                            AudioController.playCoursebotSound("select");
                            onSave?.(titleInput);
                        }}
                    >
                        Сохранить
                    </button>
                </div>
            )}

            {isSaveMode && !isEmpty && (
                <div className="slot-info-modal__overwrite">
                    <span className="slot-info-modal__label overwrite-slot">
                        Перезаписать существующий фрагмент?
                    </span>
                    <div className="slot-info-modal__preview">
                        {savePayload?.thumbnailUrl && (
                            <img src={savePayload.thumbnailUrl} />
                        )}
                        <div className="slot-info-modal__metadata">
                            <span className="slot-info-modal__label metadata-createdAt">
                                {savePayload?.createdAt ?? "??.??.????"}
                                {/* {data.data?.createdAt ?? "??.??.????"} */}
                            </span>
                            <span className="slot-info-modal__label metadata-currentTime">
                                {formatTimecode(savePayload?.timecode) ?? "0:00:00"}
                                {/* {data.data?.timecode ?? "0:00:00"} */}
                            </span>
                        </div>
                    </div>

                    <div className="slot-info-modal__block">
                        <span>Название:</span>
                        <input
                            className="slot-info-modal__input"
                            // placeholder="Название фрагмента"
                            value={titleInput}
                            onChange={(e) => setTitleInput(e.target.value)}
                        />
                    </div>

                    <div className="slot-info-modal__button-group">
                        <button
                            className="slot-info-modal__button save-button"
                            onClick={() => {
                                AudioController.playCoursebotSound("select");
                                onOverwrite?.(titleInput);
                            }}
                        >
                            Перезаписать
                        </button>
                        <button
                            className="slot-info-modal__button cancel-button"
                            onClick={closeModal}
                        >
                            Назад
                        </button>
                    </div>
                </div>
            )}

            {(((!isEmpty && !isSaveMode && !isAutosaveMode) && currentData) && !slotDataEditMode && !openCompletedWatchAutosave) && (
                <>
                    <div className="slot-info-modal__main">
                        <div className="slot-info-modal__main-left">
                            <div className="slot-info-modal__preview">
                                {currentData?.thumbnailUrl && (
                                    <img src={currentData.thumbnailUrl} />
                                )}
                                <div className="slot-info-modal__metadata">
                                    <span className="slot-info-modal__label metadata-createdAt">
                                        {currentData?.createdAt ?? "??.??.????"}
                                    </span>
                                    <span className="slot-info-modal__label metadata-currentTime">
                                        {formatTimecode(currentData?.timecode) ?? "0:00:00"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="slot-info-modal__main-right">
                            {(isEditMode) && (isAutosave && data.data?.isAutosave && data.data.data.playerState) ? (
                                <div className="slot-info-modal__autosave-details">
                                    <div className="slot-info-modal__autosave-details-item">
                                        <img src="/images/coursebot/slotinfo-modal/autosave-details/player-mode.svg" />
                                        <span>{data.data.data.playerState.mode === 'free' ? 'Выборочный просмотр' : 'Полноценный просмотр'}</span>
                                    </div>
                                    {data.data.data.playerState.watchInfo?.watchNumber && (
                                        <div className="slot-info-modal__autosave-details-item">
                                            <img src="/images/coursebot/slotinfo-modal/autosave-details/view-number.svg" />
                                            <span>{data.data.data.playerState.watchInfo.watchNumber}-й просмотр</span>
                                        </div>
                                    )}
                                    {data.data.data.playerState.watchInfo?.startDate && (
                                        <div className="slot-info-modal__autosave-details-item">
                                            <img src="/images/coursebot/slotinfo-modal/autosave-details/start-date.svg" />
                                            <span>Начало просмотра: {data.data.data.playerState.watchInfo?.startDate}</span>
                                        </div>
                                    )}
                                    {currentWatchInfo && (
                                        <div className="slot-info-modal__autosave-details-item">
                                            <img src="/images/coursebot/slotinfo-modal/autosave-details/end-date.svg" />
                                            <span>Окончание просмотра: {currentWatchInfo.end}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <button
                                        className="slot-info-modal__button"
                                        onClick={() => {
                                            AudioController.playCoursebotSound("slotinfo_button", "/audio/sound/coursebot/coursebot-slotinfo-button.wav");
                                            setSlotDataEditMode('delete');
                                        }}
                                    >
                                        Удалить
                                    </button>

                                    <button
                                        className="slot-info-modal__button"
                                        onClick={() => {
                                            AudioController.playCoursebotSound("slotinfo_button", "/audio/sound/coursebot/coursebot-slotinfo-button.wav");
                                            setSlotDataEditMode('title');
                                        }}
                                    >
                                        Редактировать
                                    </button>
                                    {/* 
                                    <button
                                        className="slot-info-modal__button"
                                        onClick={() => onOverwrite?.(titleInput)}
                                    >
                                        Изменить позицию
                                    </button> */}
                                </>
                            )}
                        </div>
                    </div>

                    {(!data.data || openCompletedWatchAutosave) ? (<></>) : (isAutosave) ? (
                        <div className="slot-info-modal__buttons">
                            <div className="slot-info-modal__button-group">
                                <button
                                    className="slot-info-modal__button mylift-player-button"
                                    onClick={(e) => {
                                        if (currentWatchInfo?.completed || currentWatchInfo?.end) {
                                            AudioController.playCoursebotSound("select", "/audio/sound/coursebot/coursebot-select-button.wav");
                                            setOpenCompletedWatchAutosave(true);
                                        } else openInMyLiftPlayer(e);
                                    }}
                                >
                                    Открыть в <span className="mylift">MyLift Player</span>
                                </button>

                                <button
                                    className="slot-info-modal__button coursebot-player-button"
                                    onClick={openInCoursebotPlayer}
                                >
                                    Открыть в Coursebot Player
                                </button>
                            </div>
                            <button
                                className="slot-info-modal__button clear-autosave-button"
                                onClick={() => {
                                    AudioController.playCoursebotSound("slotinfo_button");
                                    setSlotDataEditMode('delete');
                                }}
                            >
                                Очистить автосохранение
                            </button>
                        </div>
                    ) : (
                        (
                            <div className="slot-info-modal__buttons">
                                <button
                                    className="slot-info-modal__button mylift-player-button"
                                    onClick={openInMyLiftPlayer}
                                >
                                    Открыть в <span className="mylift">MyLift Player</span>
                                </button>

                                <button
                                    className="slot-info-modal__button coursebot-player-button"
                                    onClick={openInCoursebotPlayer}
                                >
                                    Открыть в Coursebot Player
                                </button>
                            </div>
                        )
                    )}
                </>
            )}

            {(slotDataEditMode === 'title' && (!isEmpty)) && (
                <div className="slot-info-modal__save-form">
                    {/* <span className="slot-info-modal__label overwrite-slot">
                        Редактировать данные:
                    </span> */}
                    <div className="slot-info-modal__preview slot-edit-mode">
                        {currentData?.thumbnailUrl && (
                            <img src={currentData.thumbnailUrl} />
                        )}
                        <div className="slot-info-modal__metadata">
                            <span className="slot-info-modal__label metadata-createdAt">
                                {currentData?.createdAt ?? "??.??.????"}
                            </span>
                            <span className="slot-info-modal__label metadata-currentTime">
                                {formatTimecode(currentData?.timecode) ?? "0:00:00"}
                            </span>
                        </div>
                    </div>
                    <div className="slot-info-modal__block">
                        <span>Название:</span>
                        <input
                            className="slot-info-modal__input"
                            // placeholder="Название фрагмента"
                            value={titleInput}
                            onChange={(e) => setTitleInput(e.target.value)}
                        />
                    </div>
                    <button
                        className="slot-info-modal__button save-button"
                        onClick={() => {
                            AudioController.playCoursebotSound("select");
                            setSlotDataEditMode(null);
                            onEdit?.({
                                title: titleInput,
                            });
                        }}
                    >
                        Сохранить
                    </button>
                    <button
                        className="slot-info-modal__button save-button"
                        onClick={() => {
                            AudioController.playCoursebotSound("close");
                            setSlotDataEditMode(null);
                        }}
                    >
                        Назад
                    </button>
                </div>
            )}

            {(slotDataEditMode === 'delete' && (!isEmpty)) && (
                <div className="slot-info-modal__save-form">
                    <span className="slot-info-modal__label overwrite-slot">
                        {isAutosave ?
                            "Очистить Автосохранение? Данные будут удалены безвозвратно!" :
                            "Удалить данные без возможности восстановления?"}
                    </span>
                    <div className="slot-info-modal__preview slot-edit-mode">
                        {currentData?.thumbnailUrl && (
                            <img src={currentData.thumbnailUrl} />
                        )}
                        <div className="slot-info-modal__metadata">
                            <span className="slot-info-modal__label metadata-createdAt">
                                {currentData?.createdAt ?? "??.??.????"}
                            </span>
                            <span className="slot-info-modal__label metadata-currentTime">
                                {formatTimecode(currentData?.timecode) ?? "0:00:00"}
                            </span>
                        </div>
                    </div>
                    <button
                        className="slot-info-modal__button delete-button"
                        onClick={() => {
                            AudioController.playCoursebotSound("select");
                            setSlotDataEditMode(null);
                            if (isAutosave) onClearAutosave?.();
                            else onDelete?.();
                        }}
                    >
                        {isAutosave ? "Очистить Автосохранение" : "Удалить"}
                    </button>
                    <button
                        className="slot-info-modal__button save-button"
                        onClick={() => {
                            AudioController.playCoursebotSound("close");
                            setSlotDataEditMode(null)
                        }}
                    >
                        Назад
                    </button>
                </div>
            )}

            {(openCompletedWatchAutosave && (!isEmpty) && isAutosave) && (
                <div className="slot-info-modal__save-form">
                    <span className="slot-info-modal__label open-completed-autosave">
                        Просмотр, в котором было выполнено данное автосохранение, уже завершён!
                        Открыть автосохранение в режиме «Выборочный просмотр»?
                    </span>
                    <div className="slot-info-modal__preview slot-edit-mode">
                        {currentData?.thumbnailUrl && (
                            <img src={currentData.thumbnailUrl} />
                        )}
                        <div className="slot-info-modal__metadata">
                            <span className="slot-info-modal__label metadata-createdAt">
                                {currentData?.createdAt ?? "??.??.????"}
                            </span>
                            <span className="slot-info-modal__label metadata-currentTime">
                                {formatTimecode(currentData?.timecode) ?? "0:00:00"}
                            </span>
                        </div>
                    </div>
                    <button
                        className="slot-info-modal__button mylift-player-button"
                        onClick={(e) => {
                            AudioController.playCoursebotSound("select");
                            openInMyLiftPlayer(e, 'free');
                            // setSlotDataEditMode(null);
                            // if (isAutosave) onClearAutosave?.();
                            // else onDelete?.();
                        }}
                    >
                        Открыть в <span className="mylift">MyLift Player</span> [Выборочный просмотр]
                    </button>
                    <button
                        className="slot-info-modal__button save-button"
                        onClick={() => {
                            AudioController.playCoursebotSound("close");
                            setOpenCompletedWatchAutosave(false);
                        }}
                    >
                        Назад
                    </button>
                </div>
            )}
        </div>
    );
}
