import "./FloorSelector.css";
import { CSSProperties, useEffect, useState } from "react";
import { AccessCondition, FloorConfig } from "@/types/data/FloorTypes";
import { VideoSettingsModalProps } from "@/types/components/VideoSettingsModal/VideoSettingsModal";
import { VideoData } from "@/types/data/VideoData";

export default function FloorSelector({ floorList,
    updateFloor,
    updateAccessCondition,
    addFloor,
    removeFloor,
    openVideoSettingsModal,
    closeVideoSettingsModal,
    updateVideoData,
    styles,
}: {
    floorList: FloorConfig[];
    updateFloor: (prop: string, value: any, index: number) => void;
    updateAccessCondition: (floorIdx: number, value: Partial<AccessCondition>) => void;
    addFloor?: () => void;
    removeFloor: (floorIdx: number) => void;
    openVideoSettingsModal: (props: VideoSettingsModalProps) => void;
    closeVideoSettingsModal: () => void;
    updateVideoData: (floorIdx: number, value: Partial<VideoData>) => void;
    styles?: CSSProperties;
}) {
    const [floors, setFloors] = useState<FloorConfig[]>(floorList);

    useEffect(() => setFloors(floorList), [floorList]);

    return (
        <div className="floor-selector">
            <div className="floor-selector__block flex-col floor-list" style={styles}>
                {floors.map((floor, idx) => (
                    <div className="floor-selector__floor-block" key={idx}>
                        <div className="floor-selector__floor-block-left">
                            <div className="floor-selector__floor-tile">{(idx + 1)}F</div>
                            <div className="floor-selector__floor-tile">
                                <span className="floor-selector__floor-text">Отобразить как:</span>
                                <input type="text" className="floor-selector__input floor-symbol-input" onChange={(e) => updateFloor("displaySymbol", e.target.value, idx)} value={floor.displaySymbol} />
                            </div>
                            <div className="floor-selector__floor-tile">
                                <span className="floor-selector__floor-text">Доступность:</span>
                                <select
                                    className="floor-selector__input floor-access-select"
                                    value={floor.accessCondition?.type || 'free'}
                                    onChange={(e) => updateFloor("accessCondition", ((e.target.value === 'viewCount') ? { type: e.target.value, requiredViews: 1, floor: 1 } : { type: e.target.value }), idx)}
                                >
                                    <option value="free">всегда</option>
                                    <option value="viewCount">после просмотра видео</option>
                                    <option value="blocked">заблокирован</option>
                                </select>
                                {floor.accessCondition?.type === 'viewCount' && (
                                    <>
                                        <input
                                            type="number"
                                            min={1}
                                            max={9}
                                            className="floor-selector__input floor-view-count-input"
                                            value={floor.accessCondition?.requiredViews || 1}
                                            onChange={(e) => updateAccessCondition(idx, { requiredViews: Number(e.target.value) })}

                                        />
                                        <span className="floor-selector__text ml-1">раз{([2, 3, 4].includes(Number(floor.accessCondition?.requiredViews || 1))) && 'а'} на</span>
                                        <select
                                            className="floor-selector__input floor-number-select"
                                            value={floor.accessCondition?.floor}
                                            onChange={(e) => updateAccessCondition(idx, { floor: Number(e.target.value) })}
                                        >
                                            {floors.map((floor, i) => (i !== idx) && <option key={i} value={(i + 1)}>{(i + 1)}F</option>)}
                                        </select>

                                    </>
                                )}
                            </div>
                            <div className="floor-selector__floor-tile">
                                <button
                                    className="floor-selector__button floor-video-button"
                                    onClick={() => openVideoSettingsModal({
                                        floor: floors[idx],
                                        idx,
                                        updateVideoData,
                                        onClose: closeVideoSettingsModal,
                                        // onClose: () => setOpenedModal(null),
                                    })}>
                                    <span>Видео {(floor.videoData?.title && floor.videoData.title.length < 34) && <span className="small-text">
                                        ({floor.videoData?.title})
                                    </span>}...</span>
                                </button>
                            </div>
                        </div>
                        <div className="floor-selector__floor-block-right">
                            {floors.length > 1 && <div className="floor-selector__floor-tile">
                                <button className="floor-selector__button remove-floor-button" onClick={() => removeFloor(idx)}>
                                    <span>×</span>
                                </button>
                            </div>}
                        </div>
                    </div>
                ))}
            </div>
            <div className="floor-selector__block">
                {addFloor ? <button className="floor-selector__button add-floor-button" onClick={addFloor}>+ Новый этаж</button> : <></>}
            </div>
        </div>
    );

    // return (
    //     <div className="floor-selector">
    //         <div className="floor-selector__block flex-col floor-list">
    //             {floors.map((floor, idx) => (
    //                 <div className="floor-selector__floor-block" key={idx}>
    //                     <div className="floor-selector__floor-block-left">
    //                         <div className="floor-selector__floor-tile">{(idx + 1)}F</div>
    //                         <div className="floor-selector__floor-tile">
    //                             <span className="floor-selector__floor-text">Отобразить как:</span>
    //                             <input type="text" className="floor-selector__input floor-symbol-input" onChange={(e) => updateFloor("displaySymbol", e.target.value, idx)} value={floor.displaySymbol} />
    //                         </div>
    //                         <div className="floor-selector__floor-tile">
    //                             <span className="floor-selector__floor-text">Доступность:</span>
    //                             <select
    //                                 className="floor-selector__input floor-access-select"
    //                                 value={floor.accessCondition?.type || 'free'}
    //                                 onChange={(e) => updateFloor("accessCondition", ((e.target.value === 'viewCount') ? { type: e.target.value, requiredViews: 1, floor: 1 } : { type: e.target.value }), idx)}
    //                             >
    //                                 <option value="free">всегда</option>
    //                                 <option value="viewCount">после просмотра видео</option>
    //                                 <option value="blocked">заблокирован</option>
    //                             </select>
    //                             {floor.accessCondition?.type === 'viewCount' && (
    //                                 <>
    //                                     <input
    //                                         type="number"
    //                                         min={1}
    //                                         max={9}
    //                                         className="floor-selector__input floor-view-count-input"
    //                                         value={floor.accessCondition?.requiredViews || 1}
    //                                         onChange={(e) => updateAccessCondition(idx, { requiredViews: Number(e.target.value) })}

    //                                     />
    //                                     <span className="floor-selector__text ml-1">раз{([2, 3, 4].includes(Number(floor.accessCondition?.requiredViews || 1))) && 'а'} на</span>
    //                                     <select
    //                                         className="floor-selector__input floor-number-select"
    //                                         value={floor.accessCondition?.floor}
    //                                         onChange={(e) => updateAccessCondition(idx, { floor: Number(e.target.value) })}
    //                                     >
    //                                         {floors.map((floor, i) => (i !== idx) && <option key={i} value={(i + 1)}>{(i + 1)}F</option>)}
    //                                     </select>

    //                                 </>
    //                             )}
    //                         </div>
    //                         <div className="floor-selector__floor-tile">
    //                             <button
    //                                 className="floor-selector__button floor-video-button"
    //                                 onClick={() => openVideoSettingsModal({
    //                                     floor: floors[idx],
    //                                     idx,
    //                                     updateVideoData,
    //                                     onClose: closeVideoSettingsModal,
    //                                     // onClose: () => setOpenedModal(null),
    //                                 })}>
    //                                 <span>Видео {(floor.videoData?.title && floor.videoData.title.length < 34) && <span className="small-text">
    //                                     ({floor.videoData?.title})
    //                                 </span>}...</span>
    //                             </button>
    //                         </div>
    //                     </div>
    //                     <div className="floor-selector__floor-block-right">
    //                         {floors.length > 1 && <div className="floor-selector__floor-tile">
    //                             <button className="floor-selector__button remove-floor-button" onClick={() => removeFloor(idx)}>
    //                                 <span>×</span>
    //                             </button>
    //                         </div>}
    //                     </div>
    //                 </div>
    //             ))}
    //         </div>
    //         <div className="floor-selector__block">
    //             <button className="floor-selector__button add-floor-button" onClick={addFloor}>+ Новый этаж</button>
    //         </div>
    //     </div>
    // );
}