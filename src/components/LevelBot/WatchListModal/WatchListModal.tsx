import { VideoStats } from "@/types/elevator";
import "./WatchListModal.css";
import AudioController from "@/core/audio/AudioController";

export default function WatchListModal({ opened, data, onClose }: { opened?: boolean; data?: VideoStats, onClose?: () => void }) {
    return (
        <div className={`watch-list-modal__container ${opened ? `opened` : ``}`}>
            <div className="watch-list-modal">
                <div className="watch-list-modal__main">
                    <h1 className="watch-list-modal__title">История просмотров:</h1>
                    <div className="watch-list-modal__list">
                        {data?.watchHistory?.map((item, idx) => {
                            return (
                                <div className="watch-list-modal__block" key={idx}>
                                    <div className="watch-list-modal__block-left">
                                        <span>№{idx + 1}</span>
                                    </div>
                                    <div className="watch-list-modal__block-right">
                                        {item.start} — {item.end}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="watch-list-modal__buttons">
                    <button className="watch-list-modal__button" onClick={() => {
                        AudioController.playCoursebotSound("watchlist_close_btn");
                        onClose?.();
                    }}>Закрыть</button>
                </div>
            </div>
        </div>
    );
}