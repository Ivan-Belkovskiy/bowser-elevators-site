'use client';
import { useEffect, useState } from "react";
import "./ElevatorVideoPlayer.css";

export default function ElevatorVideoPlayer({ liftData, editMode }: { liftData: any, editMode: boolean }) {
    const [data, setData] = useState(liftData);
    const [editingBlock, setEditingBlock] = useState<[number, string] | null>(null);
    const [dragInfo, setDragInfo] = useState<{ idx: number, startY: number, mouseStartY: number } | null>(null);

    const updateButtonPanelBlock = (idx: number, block: any) => {
        const blocks = [...data.elevator.buttonPanel.blocks];
        blocks[idx] = block;
        setData({
            ...data,
            elevator: {
                ...data.elevator,
                buttonPanel: {
                    ...data.elevator.buttonPanel,
                    blocks: blocks,
                }
            }
        });
    };

    const onMouseDownBlock = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
        if (!editMode) return;
        setEditingBlock([idx, 'move']);
        setDragInfo({
            idx,
            startY: data.elevator.buttonPanel.blocks[idx].position?.y || 0,
            mouseStartY: e.clientY
        });
    };

    const onMouseMoveBlock = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!dragInfo || !editingBlockIs(dragInfo.idx, 'move')) return;
        const delta = e.clientY - dragInfo.mouseStartY;
        const newY = dragInfo.startY + delta;
        updateButtonPanelBlock(dragInfo.idx, {
            ...data.elevator.buttonPanel.blocks[dragInfo.idx],
            position: { y: newY }
        });
    };

    const onMouseUpBlock = () => {
        setEditingBlock(null);
        setDragInfo(null);
    };

    const editingBlockIs = (idx: number, action: string) =>
        editingBlock?.[0] === idx && editingBlock?.[1] === action;

    useEffect(() => setData(liftData), [liftData]);

    return (
        <div className={`elevator-video-player ${(editMode) && 'edit-mode'}`}>
            <div className="elevator-video-player__wall left-wall" style={{
                backgroundImage: `url('/images/elevators/template/MLM-2023/elevator-wall-left.png')`,
            }}></div>

            <div className="elevator-video-player__doors">
                <img src="/images/elevators/template/MLM-2023/elevator-door.png" alt="" className="elevator-video-player__door left-door" />
                <img src="/images/elevators/template/MLM-2023/elevator-door.png" alt="" className="elevator-video-player__door right-door" />
            </div>

            <div className="elevator-video-player__wall right-wall" style={{
                backgroundImage: `url('/images/elevators/template/MLM-2023/elevator-wall-right.png')`,
            }}>
                <div className="elevator-video-player__button-panel" style={{
                    backgroundImage: `url('/images/elevators/template/MLM-2023/elevator-buttonpanel-01.png')`
                }}>
                    <div
                        className={`elevator-video-player__button-block floor-buttons ${(editMode && editingBlockIs(0, 'move')) && 'edit-move'}`}
                        style={{ top: `${data.elevator.buttonPanel.blocks[0].position?.y || 480}px` }}
                        onMouseDown={(e) => onMouseDownBlock(e, 0)}
                        onMouseMove={onMouseMoveBlock}
                        onMouseUp={onMouseUpBlock}
                    >
                        {data.elevator.buttonPanel.blocks[0].buttons.map((button: any, index: number) => {
                            if (button.type === 'empty') {
                                return <button className="elevator-video-player__button empty-button" key={index}></button>;
                            } else {
                                const styles = (button.styles.default instanceof CSSStyleDeclaration) ? button.styles.default : {
                                    backgroundImage: `url('${button.styles.default}')`,
                                };
                                return <button className="elevator-video-player__button" style={styles} key={index}></button>;
                            }
                        })}
                    </div>

                    <div
                        className={`elevator-video-player__button-block action-buttons ${(editMode && editingBlockIs(1, 'move')) && 'edit-move'}`}
                        style={{ top: `${data.elevator.buttonPanel.blocks[1].position?.y || 550}px` }}
                        onMouseDown={(e) => onMouseDownBlock(e, 1)}
                        onMouseMove={onMouseMoveBlock}
                        onMouseUp={onMouseUpBlock}
                    >
                        {data.elevator.buttonPanel.blocks[1].buttons.map((button: any, index: number) => {
                            if (button.type === 'empty') {
                                return <button className="elevator-video-player__button empty-button" key={index}></button>;
                            } else {
                                const styles = (button.styles.default instanceof CSSStyleDeclaration) ? button.styles.default : {
                                    backgroundImage: `url('${button.styles.default}')`,
                                };
                                return <button className="elevator-video-player__button" style={styles} key={index}></button>;
                            }
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
