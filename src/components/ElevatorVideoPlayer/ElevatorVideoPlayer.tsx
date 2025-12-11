'use client';
import { CSSProperties, useEffect, useState } from "react";
import "./ElevatorVideoPlayer.css";
import ButtonOptionsModal from "./ButtonOptionsModal/ButtonOptionsModal";
import { ElevatorButton, LiftJson } from "@/types/elevator";

export default function ElevatorVideoPlayer({ liftData, editMode }: { liftData: LiftJson, editMode: boolean }) {
    const [data, setData] = useState(liftData);
    const [editingBlock, setEditingBlock] = useState<[number, string] | null>(null);
    const [dragInfo, setDragInfo] = useState<{ idx: number, startY: number, mouseStartY: number } | null>(null);
    const [activeButton, setActiveButton] = useState<[number, number, ElevatorButton] | null>(null);
    // const [draggedButton, setDraggedButton] = useState<{ blockIdx: number, btnIdx: number } | null>(null);

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

    // --- Drag-n-drop блоков ---
    const onMouseDownBlock = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
        if (!editMode) return;
        if (!editingBlockIs(idx, 'active')) setEditingBlock([idx, 'move']);
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
        // setEditingBlock(null);
        if (editingBlock) setEditingBlock([editingBlock[0], 'active']);
        setDragInfo(null);
    };

    const editingBlockIs = (idx: number, action: string) =>
        editingBlock?.[0] === idx && editingBlock?.[1] === action;

    const onButtonClick = (button: ElevatorButton, btnIdx: number, blockIdx: number) => {
        if (button.type === 'empty') return;
        setActiveButton([blockIdx, btnIdx, button]);
    }

    const onSaveButton = (blockIdx: number, btnIdx: number, button: ElevatorButton) => {
        // alert(`blockIdx: ${blockIdx}\nbtnIdx: ${btnIdx}`);
        const block = data.elevator.buttonPanel.blocks[blockIdx];
        const newButtons = block.buttons.map((btn, idx) => idx === btnIdx ? button : btn);
        updateButtonPanelBlock(blockIdx, { ...block, buttons: newButtons });
        setActiveButton(null);
    }

    // useEffect(() => {
    //     const reversed01 = [...liftData.elevator.buttonPanel.blocks[0].buttons].reverse();
    //     setData({
    //         ...liftData,
    //         elevator: {
    //             ...liftData.elevator,
    //             buttonPanel: {
    //                 ...liftData.elevator.buttonPanel,
    //                 blocks: [
    //                     { ...liftData.elevator.buttonPanel.blocks[0], buttons: reversed01 },
    //                     liftData.elevator.buttonPanel.blocks[1]
    //                 ]
    //             }
    //         }
    //     });
    // }, [liftData]);

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
                    {/* Floor buttons block */}
                    <div
                        // className={`elevator-video-player__button-block floor-buttons ${(editMode && editingBlockIs(0, 'move')) && 'edit-move'}`}
                        className={`elevator-video-player__button-block floor-buttons ${(editMode && editingBlock?.[0] === 0) && `edit-${editingBlock[1]}`}`}
                        style={{ top: `${data.elevator.buttonPanel.blocks[0].position?.y || 480}px` }}
                        onMouseDown={(e) => onMouseDownBlock(e, 0)}
                        onMouseMove={onMouseMoveBlock}
                        onMouseUp={onMouseUpBlock}
                    >
                        {data.elevator.buttonPanel.blocks[0].buttons.map((button: ElevatorButton, index: number) => {
                            const styles = (button.type !== 'empty') ? ((typeof button.styles?.default === 'string') ? {
                                backgroundImage: `url('${button.styles.default}')`,
                            } : button.styles.default) : {
                                backgroundImage: undefined,
                            };
                            if (button.type !== 'empty') console.log(button.styles.default);
                            return (
                                <button
                                    className={`elevator-video-player__button ${button.type === 'empty' ? 'empty-button' : ''} ${activeButton && activeButton[0] === 0 && activeButton[1] === index ? 'edit-active' : ''}`}
                                    style={styles as CSSProperties}
                                    key={index}
                                    onClick={() => onButtonClick(button, index, 0)}
                                >{(button.type === 'floor' && button.showFloorSymbol) && (button.destinationFloor + 1)}</button>
                            );
                        })}
                    </div>

                    {/* Action buttons block */}
                    <div
                        // className={`elevator-video-player__button-block action-buttons ${(editMode && editingBlockIs(1, 'move')) && 'edit-move'}`}
                        className={`elevator-video-player__button-block action-buttons ${(editMode && editingBlock?.[0] === 1) ? `edit-${editingBlock[1]}` : ``}`}
                        style={{ top: `${data.elevator.buttonPanel.blocks[1].position?.y || 550}px` }}
                        onMouseDown={(e) => onMouseDownBlock(e, 1)}
                        onMouseMove={onMouseMoveBlock}
                        onMouseUp={onMouseUpBlock}
                    >
                        {data.elevator.buttonPanel.blocks[1].buttons.map((button: any, index: number) => {
                            const styles = (button.styles?.default instanceof CSSStyleDeclaration) ? button.styles.default : {
                                backgroundImage: button.type !== 'empty' ? `url('${button.styles.default}')` : undefined,
                            };
                            return (
                                <button
                                    className={`elevator-video-player__button ${button.type === 'empty' ? 'empty-button' : ''} ${activeButton && activeButton[0] === 1 && activeButton[1] === index ? 'edit-active' : ''}`}
                                    style={styles}
                                    key={index}
                                    onClick={() => onButtonClick(button, index, 1)}
                                ></button>
                            );
                        })}
                    </div>
                </div>
                <ButtonOptionsModal elevator={data} button={activeButton} onSave={onSaveButton} onClose={() => setActiveButton(null)} />
            </div>
        </div>
    );
}
