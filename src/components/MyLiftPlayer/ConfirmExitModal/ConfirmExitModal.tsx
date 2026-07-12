import React from 'react';
import './ConfirmExitModal.css';
import { MyLiftPlayerMode } from '../MyLiftPlayer';

interface ConfirmExitModalProps {
    playerMode: MyLiftPlayerMode;
    info?: ConfirmExitModalInfo;
    visible: boolean;
    onConfirm: () => void;
    onSaveAndExit: () => void;
    onClose: () => void;
}

export interface ConfirmExitModalInfo {
    action: 'exit' | 'select';
    onConfirm?: () => void;
    onSaveAndExit?: () => void;
    onClose?: () => void;
}

export default function ConfirmExitModal({ playerMode, info, visible, onConfirm, onSaveAndExit, onClose }: ConfirmExitModalProps) {
    if (!visible) return null;

    return (
        <div className="confirm-exit-modal__overlay">
            <div className="confirm-exit-modal">
                <h2 className='confirm-exit-modal__header'>{`${(info?.action === 'exit') ? `Выйти из MyLift Player` : `Выбрать другое видео`}? ${(playerMode === 'full') ? "Несохраненный прогресс будет удален!" : ""}`}</h2>
                <div className="confirm-exit-modal__buttons">
                    {(playerMode === 'free') ? (
                        <>
                            <button className="confirm-exit-modal__button" onClick={() => {
                                onClose();
                                info?.onClose?.();
                            }}>Остаться</button>
                            <button className="confirm-exit-modal__button close-button" onClick={() => {
                                onConfirm();
                                info?.onConfirm?.();
                            }}>{(info?.action === 'select') ? "Переключить видео" : "Выйти"}</button>
                        </>
                    ) : (
                        <>
                            <button className="confirm-exit-modal__button" onClick={() => {
                                onSaveAndExit();
                                info?.onSaveAndExit?.();
                            }}>Сохранить и {(info?.action === 'select') ? "переключить" : "выйти"}</button>
                            <button className="confirm-exit-modal__button close-button" onClick={() => {
                                onConfirm();
                                info?.onConfirm?.();
                            }}>{(info?.action === 'select') ? "Переключить" : "Выйти"} без сохранения</button>
                            <button className="confirm-exit-modal__button" onClick={() => {
                                onClose();
                                info?.onClose?.();
                            }}>Вернуться в MyLift Player</button>
                        </>
                    )}
                </div>
                {/* <div className="confirm-exit-modal__options">
                    <div className="confirm-exit-modal__option">
                        <button className="confirm-exit-modal__button" onClick={() => true}>Выборочный просмотр</button>
                        <span className="confirm-exit-modal__label">Произвольный просмотр с возможностью перемотки без ограничений</span>
                    </div>
                    <div className="confirm-exit-modal__option">
                        <button className="confirm-exit-modal__button" onClick={() => true}>Полноценный просмотр</button>
                        <span className="confirm-exit-modal__label">Просмотр видео от начала до конца. Можно перематывать только в пределах просмотренной части</span>
                    </div>
                </div> */}

                {/* <button className="confirm-exit-modal__close" onClick={onClose}>Выйти</button> */}
            </div>
        </div>
    );
}