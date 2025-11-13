'use client';
import { VideoSettingsModalProps } from "@/types/components/VideoSettingsModal/VideoSettingsModal";
import "./VideoSettingsModal.css";
import { ChangeEvent, ChangeEventHandler, useRef, useState } from "react";
export default function VideoSettingsModal({ floor, idx, updateVideoData, onClose }: VideoSettingsModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false);

    const onFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target?.files?.[0] && updateVideoData) {
            // Для загрузки обложки!!!
            // const uploadedFile = e.target.files[0];
            // updateVideoData(idx, {
            //     title: uploadedFile.name.replace(/\(.+\)|.mp4/g, "").trim(),
            //     url: ''
            // });
        }
    };

    return (
        <div className="video-settings-modal">
            <div className="video-settings-modal__container">
                <h1 className="video-settings-modal__title">
                    {floor.floorNumber}F ::{" "}
                    <input
                        className="video-settings-modal__input video-title-input"
                        type="text"
                        value={floor.videoData?.title || ""}
                        onChange={(e) => updateVideoData?.(idx, { title: e.target.value })}
                        placeholder="Введите название видео..."
                    />
                </h1>
                <div className="video-settings-modal__content">
                    <div className="video-settings-modal__block">
                        <span className="video-settings-modal__label">URL видео:</span>
                        <input
                            type="text"
                            className="video-settings-modal__input video-url-input"
                            value={floor.videoData?.url || ''}
                            onChange={(e) => updateVideoData?.(idx, { url: e.target.value })}
                        />
                        <button className="video-settings-modal__button file-navigation-button">Выбрать...</button>
                    </div>
                    <div className="video-settings-modal__block">
                        <input type="file" hidden ref={fileInputRef} onChange={onFileUpload} />
                        {/* {isVideoLoaded && <button className="video-settings-modal__button upload-image-button" onClick={() => fileInputRef.current?.click()}>
                            Загрузить обложку видео
                        </button>} */}
                        <div className="video-settings-modal__video-container">
                            {!isVideoLoaded && <div className="video-settings-modal__video-overlay">Видео не найдено!</div>}
                            <video
                                className={`video-settings-modal__video ${isVideoLoaded && `loaded`}`}
                                src={`/api/video?path=${encodeURIComponent(floor.videoData?.url || '')}`}
                                controls
                                onError={() => setIsVideoLoaded(false)}
                                onLoadedData={() => setIsVideoLoaded(true)}
                            ></video>
                        </div>

                    </div>
                    <button className="video-settings-modal__button" onClick={onClose}>
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
}
