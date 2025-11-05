'use client';
import { useState } from "react";
import "./NewElevatorModal.css";
import { FloorConfig } from "@/types/FloorTypes";
export default function NewElevatorModal() {
    const [floors, setFloors] = useState<FloorConfig[]>([]);
    const addFloor = () => {
        const newFloor: FloorConfig = {
            floorNumber: (floors.length + 1),
            displaySymbol: String(floors.length + 1),
        };
        setFloors([...floors, newFloor]);
    }
    const updateFloor = (prop: string, value: string | boolean | number, index: number) => {
        // const newFloors: FloorConfig[] = floors;
        // newFloors.map((floor, idx) => idx === index ? {
        //     ...floor,
        //     [prop]: value,
        // } : floor);
        setFloors(prevFloors => prevFloors.map((floor, idx) => idx === index ? {
            ...floor,
            [prop]: value,
        } : floor));
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
                                            <select className="new-elevator-modal__input floor-access-select">
                                                <option value="free" selected>всегда</option>
                                                <option value="viewCount">после просмотра видео</option>
                                                <option value="blocked">заблокирован</option>
                                            </select>
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
        </div>
    );
}