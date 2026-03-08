'use client';
import { VideoSettingsModalProps } from "@/types/components/VideoSettingsModal/VideoSettingsModal";
import "./VideoSettingsModal.css";
import { ChangeEvent, ChangeEventHandler, useRef, useState } from "react";
import VideoFileNavigation from "../VideoFileNavigation/VideoFileNavigation";
import FileUploader from "../FileUploader/FileUploader";
export default function VideoSettingsModal({ floor, idx, updateVideoData, onClose }: VideoSettingsModalProps) {
    const [isVideoLoaded, setIsVideoLoaded] = useState<boolean | null>(null);
    const [fileNavOpened, setFileNavOpened] = useState<boolean>(false);

    const onFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        // onUpload={(e) => (e.target.files?.[0]) && updateVideoData?.(idx, { image: e.target.files[0] })}
        if (e.target?.files?.[0] && updateVideoData) {
            try {
                // alert(e.target.files[0].name);
                updateVideoData(idx, {
                    image: e.target.files[0],
                })
                // const formData = new FormData();
                // const uploadData = {
                //     floorIdx: idx,
                //     file: e.target.files[0],
                // };
                // formData.append("floor_video_image", JSON.stringify(uploadData));

                // const res = await fetch(`/api/elevators/${elevatorId}`, {
                //     method: "PUT",
                //     body: formData,
                // });

                // const data: { success: boolean; lift: LiftJson } = await res.json();

                // if (data.success) {
                //     onSave?.(data.lift.elevator.display);
                // }
            } catch (error) {

            }
        }
    };

    return (
        <div className="video-settings-modal">
            <div className="video-settings-modal__container">
                <h1 className="video-settings-modal__title">
                    {(idx + 1)}F ::{" "}
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
                        <button className="video-settings-modal__button file-navigation-button" onClick={() => setFileNavOpened(true)}>Выбрать...</button>
                    </div>
                    <div className="video-settings-modal__block flex-col">
                        {/* <input type="file" hidden ref={fileInputRef} onChange={onFileUpload} /> */}
                        <div className="video-settings-modal__video-container">
                            {!isVideoLoaded && <div className="video-settings-modal__video-overlay">{
                                (isVideoLoaded == false) ? 'Видео не найдено!' : 'Загрузка видео...'
                            }</div>}
                            <video
                                className={`video-settings-modal__video ${isVideoLoaded && `loaded`}`}
                                src={`/api/video?path=${encodeURIComponent(floor.videoData?.url || '')}`}
                                controls
                                onError={() => setIsVideoLoaded(false)}
                                onLoadedData={() => setIsVideoLoaded(true)}
                                poster={(floor.videoData?.image instanceof File) ? URL.createObjectURL(floor.videoData.image) : floor.videoData?.image || ""}
                            ></video>
                        </div>
                        {/* {isVideoLoaded && <button className="video-settings-modal__button upload-image-button" onClick={() => fileInputRef.current?.click()}>
                            Загрузить обложку видео
                        </button>} */}
                        {isVideoLoaded && (
                            <FileUploader
                                btnClass="video-settings-modal__button upload-image-button"
                                label={{ upload: "Загрузить обложку видео", replace: "Заменить обложку..." }}
                                file={floor.videoData?.image}
                                onUpload={onFileUpload}
                                // onUpload={(e) => (e.target.files?.[0]) && updateVideoData?.(idx, { image: e.target.files[0] })}
                                hideMessage
                                accept="image/*"
                            />
                        )}

                    </div>
                    <div className="video-settings-modal__block">
                        <button className="video-settings-modal__button close-button" onClick={onClose}>
                            Закрыть
                        </button>
                    </div>
                    {fileNavOpened && <VideoFileNavigation
                        defaultPath={floor.videoData?.url || "D:/Media/"}
                        onClose={() => setFileNavOpened(false)}
                        onSelect={(value) => updateVideoData?.(idx, { url: value })}
                    />}
                </div>
            </div>
        </div>
    );
}
