'use client';
import { VideoSettingsModalProps } from "@/types/components/VideoSettingsModal/VideoSettingsModal";
import "./VideoSettingsModal.css";
import { ChangeEvent, ChangeEventHandler, useRef, useState } from "react";
import VideoFileNavigation from "../VideoFileNavigation/VideoFileNavigation";
import FileUploader from "../FileUploader/FileUploader";
import { v4 } from "uuid";
import { getVideoData } from "@/types/data/VideoData";
export default function VideoSettingsModal({ floor, idx, updateVideoData, onClose }: VideoSettingsModalProps) {
    const [isVideoLoaded, setIsVideoLoaded] = useState<boolean | null>(null);
    const [multipleVideoLoaded, setMultipleVideoLoaded] = useState<Record<number, ('loaded' | 'error')>>({});
    const [fileNavOpened, setFileNavOpened] = useState<boolean | { videoIdx: number }>(false);

    const vData = getVideoData(floor?.videoData, 0);

    const onFileUpload = async (e: ChangeEvent<HTMLInputElement>, videoIdx?: number) => {
        // onUpload={(e) => (e.target.files?.[0]) && updateVideoData?.(idx, { image: e.target.files[0] })}
        if (e.target?.files?.[0] && updateVideoData) {
            try {
                // alert(e.target.files[0].name);
                if (floor.videoData?.myLiftV2Update) {
                    updateVideoData(idx, {
                        videoList: floor.videoData.videoList.map((v, i) => (i === videoIdx) ? { ...v, image: e.target.files?.[0] } : v),
                    });
                } else {
                    updateVideoData(idx, {
                        image: e.target.files[0],
                    });
                }
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

    const addVideo = () => {
        if (floor.videoData?.myLiftV2Update) {
            updateVideoData?.(idx, {
                videoList: [...floor.videoData.videoList, {
                    id: '',
                    url: '',
                }]
            });
        }
    }

    const removeVideo = (videoIdx: number) => {
        if (floor.videoData?.myLiftV2Update) {
            updateVideoData?.(idx, {
                videoList: floor.videoData.videoList.filter((_, i) => i !== videoIdx)
            });
        }
    }

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
                        <span className="video-settings-modal__label">Версия MyLift Player:</span>
                        <select
                            className="video-settings-modal__select"
                            value={(floor.videoData?.myLiftV2Update) ? 'V2' : 'V1'}
                            onChange={(e) => {
                                if (e.target.value === 'V1') {
                                    if (floor.videoData?.myLiftV2Update) {
                                        updateVideoData?.(idx, {
                                            myLiftV2Update: false,

                                        });
                                    }
                                } else if (e.target.value === 'V2') {
                                    if (!floor.videoData?.myLiftV2Update) {
                                        updateVideoData?.(idx, {
                                            myLiftV2Update: true,
                                            videoList: (floor.videoData) ? [
                                                {
                                                    ...floor.videoData, // При выборе новой версии плеера данные видео переносятся в начало массива
                                                }
                                            ] : []
                                        })
                                    }
                                }
                            }}
                        >
                            <option value="V1">MyLift Player V1</option>
                            <option value="V2">MyLift Player V2.0</option>
                        </select>
                    </div>
                    {(floor.videoData?.myLiftV2Update) ? (
                        <>
                            {floor.videoData.videoList.map((v, vIdx) => (
                                <div className="video-settings-modal__video-item" key={vIdx}>
                                    <span className="video-settings-modal__bold-text">Видео №{vIdx + 1}</span>
                                    <div className="video-settings-modal__block">
                                        <span className="video-settings-modal__label">URL:</span>
                                        <input
                                            type="text"
                                            className="video-settings-modal__input video-url-input"
                                            value={v?.url || ''}
                                            onChange={(e) => {
                                                if (floor.videoData?.myLiftV2Update) updateVideoData?.(idx, {
                                                    videoList: floor.videoData.videoList.map((video, num) => {
                                                        if (num === vIdx) return {
                                                            ...video,
                                                            url: e.target.value,
                                                        }; else return video;
                                                    }),
                                                });
                                            }}
                                        />
                                        <button className="video-settings-modal__button file-navigation-button" onClick={() => setFileNavOpened({ videoIdx: vIdx })}>Выбрать...</button>
                                    </div>
                                    <div className="video-settings-modal__block">
                                        <span className="video-settings-modal__label">Название:</span>
                                        <input
                                            type="text"
                                            className="video-settings-modal__input video-url-input"
                                            value={v?.title || `Видео ${vIdx + 1}`}
                                            onChange={(e) => {
                                                if (floor.videoData?.myLiftV2Update) updateVideoData?.(idx, {
                                                    videoList: floor.videoData.videoList.map((video, num) => {
                                                        if (num === vIdx) return {
                                                            ...video,
                                                            title: e.target.value,
                                                        }; else return video;
                                                    }),
                                                });
                                            }}
                                        // onChange={(e) => updateVideoData?.(idx, { url: e.target.value })}
                                        />
                                    </div>
                                    <div className="video-settings-modal__block">
                                        <div className="video-settings-modal__video-container">
                                            {multipleVideoLoaded[vIdx] !== 'loaded' && <div className="video-settings-modal__video-overlay">{
                                                (multipleVideoLoaded[vIdx] === 'error') ? 'Видео не найдено!' : 'Загрузка видео...'
                                            }</div>}
                                            <video
                                                className={`video-settings-modal__video ${multipleVideoLoaded[vIdx] === 'loaded' ? `loaded` : ""}`}
                                                src={`/api/video?path=${encodeURIComponent(v?.url || '')}`}
                                                controls
                                                onError={() => setMultipleVideoLoaded({
                                                    ...multipleVideoLoaded,
                                                    [vIdx]: 'error'
                                                })}
                                                onLoadedData={() => setMultipleVideoLoaded({
                                                    ...multipleVideoLoaded,
                                                    [vIdx]: 'loaded'
                                                })}
                                                poster={(v?.image instanceof File) ? URL.createObjectURL(v.image) : v?.image || ""}
                                            ></video>
                                        </div>
                                        {isVideoLoaded && (
                                            <FileUploader
                                                btnClass="video-settings-modal__button upload-image-button"
                                                label={{ upload: "Загрузить обложку видео", replace: "Заменить обложку..." }}
                                                file={v?.image}
                                                onUpload={(e) => onFileUpload(e, vIdx)}
                                                // onUpload={(e) => (e.target.files?.[0]) && updateVideoData?.(idx, { image: e.target.files[0] })}
                                                hideMessage
                                                accept="image/*"
                                            />
                                        )}

                                    </div>
                                    {(floor.videoData?.myLiftV2Update && floor.videoData.videoList?.length > 1) && <div className="video-settings-modal__block">
                                        <button className="video-settings-modal__button file-navigation-button" onClick={() => removeVideo(vIdx)}>Удалить видео</button>
                                    </div>}
                                </div>
                            ))}
                            <div className="video-settings-modal__video-item">
                                {/* <span className="video-settings-modal__bold-text">Видео №{floor.videoData.videoList.length + 1}</span> */}
                                <div className="video-settings-modal__block">
                                    <button className="video-settings-modal__button file-navigation-button" onClick={addVideo}>Добавить видео</button>
                                </div>
                            </div>

                        </>
                    ) : (
                        <>
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
                                <div className="video-settings-modal__video-container">
                                    {!isVideoLoaded && <div className="video-settings-modal__video-overlay">{
                                        (isVideoLoaded === false) ? 'Видео не найдено!' : 'Загрузка видео...'
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
                            {fileNavOpened && <VideoFileNavigation
                                defaultPath={vData?.url || "D:/Media/"}
                                onClose={() => setFileNavOpened(false)}
                                onSelect={(value) => updateVideoData?.(idx, {
                                    id: v4(),
                                    url: value,
                                })}
                            />}
                        </>
                    )}
                    <div className="video-settings-modal__block">
                        <button className="video-settings-modal__button close-button" onClick={onClose}>
                            Закрыть
                        </button>
                    </div>
                    {(typeof fileNavOpened === 'boolean' && fileNavOpened === true) ? <VideoFileNavigation
                        defaultPath={vData?.url || "D:/Media/"}
                        onClose={() => setFileNavOpened(false)}
                        onSelect={(value) => updateVideoData?.(idx, {
                            id: v4(),
                            url: value,
                        })}
                    /> : (typeof fileNavOpened === 'object' && fileNavOpened.videoIdx && floor.videoData?.myLiftV2Update) && (
                        <VideoFileNavigation
                            defaultPath={floor.videoData.videoList[fileNavOpened.videoIdx]?.url || "D:/Media/"}
                            onClose={() => setFileNavOpened(false)}
                            onSelect={(value) => {
                                if (floor.videoData?.myLiftV2Update) updateVideoData?.(idx, {
                                    videoList: floor.videoData.videoList.map((v, i) => (i === fileNavOpened.videoIdx) ? {
                                        ...v,
                                        id: v4(),
                                        url: value,
                                    } : v)
                                });
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
