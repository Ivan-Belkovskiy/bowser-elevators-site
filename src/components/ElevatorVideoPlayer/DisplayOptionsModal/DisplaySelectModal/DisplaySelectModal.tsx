import { ElevatorDisplayConfig, ElevatorDisplayTypes } from "@/types/elevator";
import "./DisplaySelectModal.css";
import { useEffect, useState } from "react";
import { DISPLAYS } from "@/constants/displays";

export default function DisplaySelectModal({ opened, currentDisplay, onSelect, onClose }: { opened?: boolean, currentDisplay: ElevatorDisplayConfig, onClose?: () => any, onSelect?: (display: ElevatorDisplayTypes) => any }) {
    const [className, setClassName] = useState<string>('');
    const [isOpened, setIsOpened] = useState<boolean>(opened || false);
    const [filterString, setFilterString] = useState<string>('');

    const filteredDisplays = DISPLAYS.filter((display) => filterString.length === 0 || display.label.toLowerCase().includes(filterString.toLowerCase()));

    const animateModal = () => {
        if (opened === true) {
            setIsOpened(opened || false);
            setTimeout(() => {
                requestAnimationFrame(() => {
                    setClassName('opened');
                });
            }, 1);
        } else {
            setTimeout(() => {
                requestAnimationFrame(() => {
                    setClassName('');
                });
            }, 1);
        }
    }

    useEffect(() => {
        animateModal();
    }, [opened]);

    if (isOpened && currentDisplay) return (
        <div className={`display-select-modal ` + className}>
            <div className="display-select-modal__content">
                <div className="display-select-modal__item filters-item">
                    <span className="display-select-modal__label">Найти табло:</span>
                    <input
                        type="text"
                        className="display-select-modal__input search-input"
                        value={filterString}
                        onChange={(e) => setFilterString(e.target.value)}
                    />
                </div>
                {filteredDisplays.map((display, idx) => (
                    <div
                        className={`display-select-modal__item ${(currentDisplay.type === display.id) ? `selected` : ``}`}
                        onClick={() => onSelect?.(display.id)}
                        key={idx}
                    >
                        <div className="display-select-modal__item-left">
                            <div className="display-select-modal__active-box">✔</div>
                            <img width={110} src={display.preview} alt={display.label} className="display-select-modal__image" />
                        </div>
                        <div className="display-select-modal__item-right">
                            <span className="display-select-modal__label">{display.label}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="display-select-modal__buttons">
                <button
                    className="display-select-modal__button"
                    onClick={() => onClose?.()}
                >« Назад</button>
            </div>
        </div>
    );
}