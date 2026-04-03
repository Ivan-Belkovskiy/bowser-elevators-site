import { Dispatch, SetStateAction } from "react";
import "./CoursebotModal.css";
import AudioController from "@/core/audio/AudioController";
import { MyLiftPlayerMode } from "../MyLiftPlayer";

export default function CoursebotModal({ opened, playerMode = 'free', setOpened, onAutosave, onSave, onLoad }: {
    opened: boolean;
    playerMode?: MyLiftPlayerMode;
    setOpened: Dispatch<SetStateAction<boolean>>;
    onSave?: () => void;
    onAutosave?: () => void;
    onLoad?: () => void;
}) {
    if (opened) return (
        <div className={`mylift-controls-modal coursebot-modal player-mode-${playerMode}`}>
            <div className="coursebot-modal__header">
                <span>Уровнебот</span>
            </div>
            <div className="coursebot-modal__options">
                <button className="coursebot-modal__option" onClick={() => {
                    AudioController.playCoursebotSound("select", "/audio/sound/coursebot/coursebot-select-button.wav");
                    onAutosave?.();
                }}>
                    <div className="coursebot-modal__slot-preview"></div>
                    <span className="coursebot-modal__label">Обновить Автосохранение</span>
                </button>
                <button className="coursebot-modal__option" onClick={() => {
                    AudioController.playCoursebotSound("select", "/audio/sound/coursebot/coursebot-select-button.wav");
                    onSave?.();
                }}>
                    <div className="coursebot-modal__slot-preview"></div>
                    <span className="coursebot-modal__label">Сохранить данные</span>
                </button>
                <button className="coursebot-modal__option" onClick={() => {
                    AudioController.playCoursebotSound("select", "/audio/sound/coursebot/coursebot-select-button.wav");
                    onLoad?.();
                }}>
                    <div className="coursebot-modal__slot-preview"></div>
                    <span className="coursebot-modal__label">Загрузить данные</span>
                </button>
            </div>
        </div>
    )
}