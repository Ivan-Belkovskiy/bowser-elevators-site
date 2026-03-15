import React from 'react';
import './PlayModeModal.css';
import { MyLiftPlayerMode } from './MyLiftPlayer';

interface PlayModeModalProps {
    visible: boolean;
    onSelect: (mode: MyLiftPlayerMode) => void;
    onClose: () => void;
}

export default function PlayModeModal({ visible, onSelect, onClose }: PlayModeModalProps) {
    if (!visible) return null;

    return (
        <div className="play-mode-overlay">
            <div className="play-mode-modal">
                <h2 className='play-mode-header'>Выберите вариант просмотра</h2>

                <div className="play-mode-options">
                    <div className="play-mode__option">
                        <button className="play-mode-modal__button" onClick={() => onSelect('free')}>Выборочный просмотр</button>
                        <span className="play-mode-modal__label">Произвольный просмотр с возможностью перемотки без ограничений</span>
                    </div>
                    <div className="play-mode__option">
                        <button className="play-mode-modal__button" onClick={() => onSelect('full')}>Полноценный просмотр</button>
                        <span className="play-mode-modal__label">Просмотр видео от начала до конца. Можно перематывать только в пределах просмотренной части</span>
                    </div>
                </div>

                <button className="play-mode-close" onClick={onClose}>Выйти</button>
            </div>
        </div>
    );
    //   return (
    //     <div className="play-mode-overlay">
    //       <div className="play-mode-modal">
    //         <button className="play-mode-close" onClick={onClose}>×</button>

    //         <div className="play-mode-header">
    //           <h2>Выберите вариант просмотра</h2>
    //           <p>Система Bowser Elevators MyLift</p>
    //         </div>

    //         <div className="play-mode-options">
    //           {/* Вариант: Выборочный просмотр */}
    //           <div className="play-mode-card free" onClick={() => onSelect('free')}>
    //             <div className="play-mode-icon">🔓</div>
    //             <div className="play-mode-info">
    //               <h3>Выборочный просмотр</h3>
    //               <ul>
    //                 <li>Свободная перемотка видео</li>
    //                 <li>Доступ ко всем фрагментам</li>
    //                 <li>Быстрое ознакомление</li>
    //               </ul>
    //             </div>
    //             <button className="play-mode-select-btn">Выбрать</button>
    //           </div>

    //           {/* Вариант: Полноценный просмотр */}
    //           <div className="play-mode-card full" onClick={() => onSelect('full')}>
    //             <div className="play-mode-icon">🔒</div>
    //             <div className="play-mode-info">
    //               <h3>Полноценный просмотр</h3>
    //               <ul>
    //                 <li>Ограниченная перемотка (эффект кинотеатра)</li>
    //                 <li>Строгое сохранение прогресса</li>
    //                 <li>Максимальное погружение</li>
    //               </ul>
    //             </div>
    //             <button className="play-mode-select-btn">Выбрать</button>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   );
}