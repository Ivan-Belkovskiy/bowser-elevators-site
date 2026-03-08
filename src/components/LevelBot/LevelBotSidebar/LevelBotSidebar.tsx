import { Floor } from "@/types/elevator";
import "./LevelBotSidebar.css";

export default function LevelBotSidebar({ currentFloor, floors, onSelect, disabled }: { currentFloor: string, floors: Floor[], onSelect?: (floorId: string) => void, disabled?: boolean }) {
    return (
        <div className="coursebot-sidebar">
            <div className="coursebot-sidebar__floors">
                {floors.map((floor, idx) => (
                    <div className={`coursebot-sidebar__block ${floor.id === currentFloor ? 'current-floor' : ''}`} onClick={() => {
                        if (!disabled) onSelect?.(floor.id);
                    }}>
                        <span className="coursebot-sidebar__label">{idx + 1}F</span>
                        <div className="coursebot-sidebar__preview">
                            {(floor.videoData?.image) && <img src={floor.videoData?.image} />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}