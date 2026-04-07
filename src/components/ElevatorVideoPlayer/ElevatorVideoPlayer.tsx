'use client';

import { CSSProperties, useEffect, useRef, useState } from "react";
import "./ElevatorVideoPlayer.css";

import ButtonOptionsModal from "./ButtonOptionsModal/ButtonOptionsModal";
import { AutosaveSlotData, DoorAnimationConfig, ElevatorButton, ElevatorDirections, ElevatorDisplayConfig, LiftJson, SlotData } from "@/types/elevator";
import ElevatorDisplay from "./ElevatorDisplay/ElevatorDisplay";
import DisplayOptionsModal from "./DisplayOptionsModal/DisplayOptionsModal";
import LevelBotModal, { LevelBotMode, SavePayload } from "../LevelBot/LevelBotModal";

import MyLiftPlayer, { MyLiftPlayerMode, PlayerState } from "../MyLiftPlayer/MyLiftPlayer";
import { EditingSlotData } from "../LevelBot/SlotInfoModal/SlotInfoModal";
import AudioController from "@/core/audio/AudioController";
import { useElevatorEngine } from "@/hooks/elevator/useElevatorEngine";
import { useElevatorMaster } from "@/hooks/elevator/useElevatorMaster";
import { useSimpleElevator } from "@/hooks/elevator/useSimpleElevator";
import ElevatorImagesModal, { ElevatorImagesModalType } from "./ElevatorImagesModal/ElevatorImagesModal";
import { useElevator } from "@/hooks/elevator/useElevator";
import PlayModeModal from "../MyLiftPlayer/PlayModeModal";
import ConfirmExitModal from "../MyLiftPlayer/ConfirmExitModal/ConfirmExitModal";
import { usePathname } from "next/navigation";

export type ElevatorDoorState = "closed" | "closing" | "opened" | "opening";

export default function ElevatorVideoPlayer({
    liftData,
    editMode
}: {
    liftData: LiftJson;
    editMode?: boolean;
}) {
    const url = usePathname();

    const [data, setData] = useState(liftData);
    const [editingBlock, setEditingBlock] = useState<[number, string] | null>(null);
    const [dragInfo, setDragInfo] = useState<{
        idx: number;
        startY: number;
        mouseStartY: number;
    } | null>(null);

    const [activeButton, setActiveButton] = useState<[number, number, ElevatorButton] | null>(null);
    const [selectedDisplay, setSelectedDisplay] = useState<ElevatorDisplayConfig | null>(null);

    const [isCoursebotOpened, setCoursebotOpened] = useState<boolean>(false);
    const [coursebotMode, setCoursebotMode] = useState<LevelBotMode>('default');
    const [coursebotSavePayload, setSavePayload] = useState<SavePayload>();
    const [playerStateToSave, setSavePlayerState] = useState<PlayerState>();

    const [isCoursebotTransit, setIsCoursebotTransit] = useState(false);
    const [pendingSlotLoad, setPendingSlotLoad] = useState<{ slot: SlotData, floorIndex: number, isAutosave: boolean, playerMode?: MyLiftPlayerMode } | null>(null);

    const [isModeSelectorOpened, setModeSelectorOpened] = useState(false);
    const [isExitPlayerModalOpened, setExitPlayerModalOpened] = useState(false);
    const [playerMode, setPlayerMode] = useState<"full" | "free">("free");
    const activatePlayerRef = useRef<((mode: MyLiftPlayerMode) => void) | null>(null);
    const resetPlayerRef = useRef<(() => void) | null>(null);
    const requestAutosaveRef = useRef<(() => void) | null>(null);
    const modeSelectorState = useRef(false);
    const exitPlayerModalOpened = useRef(false);

    // -----------------------------
    // MyLiftPlayer integration
    // -----------------------------
    const [isPlayerOpened, setPlayerOpened] = useState(false);

    // [НЕ РАБОТАЕТ!] MyLiftPlayer передаёт сюда handleDoorCloseAttempt
    // const onDoorCloseAttemptRef = useRef<(() => void) | null>(null);

    const playerStateRef = useRef<PlayerState | null>(null);

    // ----------------------------
    // Door Animations
    // ----------------------------

    const [doorState, setDoorState] = useState<ElevatorDoorState>("closed");
    const doorStateRef = useRef<ElevatorDoorState>("closed");

    const updateDoorState = (newState: ElevatorDoorState) => {
        setDoorState(newState);
        doorStateRef.current = newState;
    };
    const [doorAnimKind, setDoorAnimKind] = useState<"open" | "close" | null>(null);
    const [doorAnimTime, setDoorAnimTime] = useState(0);
    const doorAnimFrameRef = useRef<number | null>(null);

    const openFinishTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);


    function clearDoorTimers() {
        if (openFinishTimeoutRef.current) {
            clearTimeout(openFinishTimeoutRef.current);
            openFinishTimeoutRef.current = null;
        }
        if (autoCloseTimeoutRef.current) {
            clearTimeout(autoCloseTimeoutRef.current);
            autoCloseTimeoutRef.current = null;
        }
    }


    function applyCurve(t: number, curve: DoorAnimationConfig["curve"]) {
        if (curve === "linear") return t;
        if (curve === "ease-in") return t * t;
        if (curve === "ease-out") return 1 - (1 - t) * (1 - t);
        if (curve === "ease-in-out") {
            return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        }
        return t;
    }

    function getDoorOffsets(
        anim: DoorAnimationConfig,
        tNorm: number
    ) {
        const kfs = anim.keyframes;

        if (!kfs.length) return { leftDoorX: 0, rightDoorX: 0 };
        if (kfs.length === 1) return { leftDoorX: kfs[0].leftDoorX, rightDoorX: kfs[0].rightDoorX };

        let prev = kfs[0];
        let next = kfs[kfs.length - 1];

        for (let i = 0; i < kfs.length - 1; i++) {
            if (tNorm >= kfs[i].time && tNorm <= kfs[i + 1].time) {
                prev = kfs[i];
                next = kfs[i + 1];
                break;
            }
        }

        const rawT = (tNorm - prev.time) / (next.time - prev.time);
        const t = applyCurve(rawT, anim.curve);
        const lerp = (a: number, b: number) => a + (b - a) * t;

        return {
            leftDoorX: lerp(prev.leftDoorX, next.leftDoorX),
            rightDoorX: lerp(prev.rightDoorX, next.rightDoorX),
        };
    }

    function playDoorAnimation(kind: "open" | "close") {
        const anim = data.elevator.doorConfig.animations[kind];
        if (!anim) return;

        setDoorAnimKind(kind);
        setDoorAnimTime(0);

        if (kind === 'open') updateDoorState('opening');
        else updateDoorState('closing');

        const soundUrl =
            kind === "open"
                ? data.elevator.soundEffects.doorOpen
                : data.elevator.soundEffects.doorClose;


        if (soundUrl) {
            if (kind === 'open') AudioController.playDoorOpen(soundUrl);
            else AudioController.playDoorClose(soundUrl);
        }
        // if (soundUrl) {
        //     const audio = new Audio(soundUrl);
        //     doorAudioRef.current = audio;
        //     audio.play().catch(() => { });
        // }

        const duration = anim.durationMs;
        const start = performance.now();

        const loop = (now: number) => {
            const elapsed = now - start;
            const t = Math.min(1, elapsed / duration);
            setDoorAnimTime(t);
            // console.log(t);

            if (t < 1) {
                doorAnimFrameRef.current = requestAnimationFrame(loop);
            } else {
                if (kind === 'open') updateDoorState('opened');
                else updateDoorState('closed');

                // setDoorAnimKind(null);
            }
        };

        if (doorAnimFrameRef.current) cancelAnimationFrame(doorAnimFrameRef.current);
        doorAnimFrameRef.current = requestAnimationFrame(loop);
    }


    const maxOffset = 305;
    let leftOffsetPx = 0;
    let rightOffsetPx = 0;

    const doorType = data.elevator.doorConfig.type;
    const doorOpeningDir = data.elevator.doorConfig.direction;

    if (doorAnimKind) {
        const anim = data.elevator.doorConfig.animations[doorAnimKind];
        const { leftDoorX, rightDoorX } = getDoorOffsets(anim, doorAnimTime);


        if (doorType === "central") {
            leftOffsetPx = -leftDoorX * maxOffset;
            rightOffsetPx = rightDoorX * maxOffset;
        } else if (doorType === "telescopic") {
            if (doorOpeningDir === 'left') {
                leftOffsetPx = -leftDoorX * maxOffset;
                rightOffsetPx = -rightDoorX * (maxOffset * 2);
            } else {
                leftOffsetPx = leftDoorX * (maxOffset * 2);
                rightOffsetPx = rightDoorX * maxOffset;
            }
        } else if (doorType === "single") {
            if (doorOpeningDir === "left") {
                leftOffsetPx = -leftDoorX * (maxOffset * 2);
                rightOffsetPx = 0;
            } else {
                leftOffsetPx = 0;
                rightOffsetPx = rightDoorX * (maxOffset * 2);
            }
        }
    }

    const openDoors = () => {
        if (doorStateRef.current !== "closed") return;

        clearDoorTimers();
        updateDoorState("opening");
        playDoorAnimation("open");

        openFinishTimeoutRef.current = setTimeout(() => {
            updateDoorState("opened");

            autoCloseTimeoutRef.current = setTimeout(() => {
                closeDoors();
            }, data.elevator.doorConfig.closeDelay * 1000);

        }, data.elevator.doorConfig.animations.open.durationMs);
    };

    const closeDoors = () => {
        if (doorStateRef.current !== "opened" || playerStateRef?.current?.activated || modeSelectorState.current) return;

        clearDoorTimers();
        updateDoorState("closing");
        playDoorAnimation("close");

        openFinishTimeoutRef.current = setTimeout(() => {
            updateDoorState("closed");

            // ДВЕРИ ЗАКРЫЛИСЬ - ПРОВЕРЯЕМ, НЕ НУЖНО ЛИ ЕХАТЬ ДАЛЬШЕ
            // tryStartMoving();

        }, data.elevator.doorConfig.animations.close.durationMs);
    };

    // -----------------------------
    // Button panel editing
    // -----------------------------
    const updateButtonPanelBlock = (idx: number, block: any) => {
        const blocks = [...data.elevator.buttonPanel.blocks];
        blocks[idx] = block;
        setData({
            ...data,
            elevator: {
                ...data.elevator,
                buttonPanel: {
                    ...data.elevator.buttonPanel,
                    blocks: blocks
                }
            }
        });
    };

    const onMouseDownBlock = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
        if (!editMode) return;
        if (!editingBlockIs(idx, "active")) setEditingBlock([idx, "move"]);
        setDragInfo({
            idx,
            startY: data.elevator.buttonPanel.blocks[idx].position?.y || 0,
            mouseStartY: e.clientY
        });
    };

    const onMouseMoveBlock = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!dragInfo || !editingBlockIs(dragInfo.idx, "move")) return;
        const delta = e.clientY - dragInfo.mouseStartY;
        const newY = dragInfo.startY + delta;
        updateButtonPanelBlock(dragInfo.idx, {
            ...data.elevator.buttonPanel.blocks[dragInfo.idx],
            position: { y: newY }
        });
    };

    const onMouseUpBlock = () => {
        if (editingBlock) setEditingBlock([editingBlock[0], "active"]);
        setDragInfo(null);
    };

    const editingBlockIs = (idx: number, action: string) =>
        editingBlock?.[0] === idx && editingBlock?.[1] === action;

    // ------------------------------
    // MOVEMENT
    // ------------------------------

    const { currentY, currentFloor, callElevator, resetCalls, calls, direction, isMoving, destinationFloor, moveState } = useElevator(1, data, {
        openDoors,
        closeDoors,
        doorState,
    });

    ////////////////////////

    const videoData = data.floors[currentFloor].videoData;

    const validateAccessCondition = (floor: number) => {
        const condition = data.floors[floor].accessCondition;
        if (condition?.type === 'free') return true;
        if (condition?.type === 'blocked') return false;
        if (condition?.type === 'viewCount') {
            if (data.videoStats) {
                const videoId = data.floors[condition.floor - 1]?.videoData?.id;
                const videoStats = data.videoStats[videoId || ""];
                if (videoStats?.views) return (videoStats.views >= condition.requiredViews);
                else return false;

            } else return false;
        }
    }

    const onButtonClick = async (button: ElevatorButton, btnIdx: number, blockIdx: number) => {
        if (editMode) {
            if (button.type === "empty") return;
            setActiveButton([blockIdx, btnIdx, button]);
            return;
        }
        await AudioController.playElevatorButtonClick(data.elevator.soundEffects.buttonClick || "");
        if (isCoursebotTransit) return;
        
        if (button.type === "floor") {
            if (!validateAccessCondition(button.destinationFloor)) return;
            if (currentFloor === button.destinationFloor) openDoors();
            else callElevator(button.destinationFloor);
            return;
        }

        if (button.type === "action") {
            if (button.action.element === "Elevator") {
                if (button.action.command === "doorOpen") {
                    if (!isMoving) openDoors();
                } else if (button.action.command === "doorClose") {
                    if (playerStateRef.current?.activated) {
                        setExitPlayerModalOpened(true);
                    } else {
                        closeDoors();
                    }
                } else if (button.action.command === "resetCalls") {
                    resetCalls();
                }
            }

            if (button.action.element === "Coursebot") {
                if (button.action.command === "openDefaultMode") {
                    setCoursebotMode('default');
                    setCoursebotOpened(true);
                } else if (button.action.command === "requestAutosave") {
                    requestAutosaveRef.current?.();
                }
            }
        }
    };

    // -----------------------------
    // Save button changes
    // -----------------------------
    const onSaveButton = (blockIdx: number, btnIdx: number, button: ElevatorButton) => {
        const block = data.elevator.buttonPanel.blocks[blockIdx];
        const newButtons = block.buttons.map((btn, idx) => (idx === btnIdx ? button : btn));
        updateButtonPanelBlock(blockIdx, { ...block, buttons: newButtons });
        setActiveButton(null);
    };

    const onSaveDisplay = (updated: ElevatorDisplayConfig) => {
        setData({
            ...data,
            elevator: {
                ...data.elevator,
                display: updated
            }
        });
        setSelectedDisplay(null);
    };

    const openCoursebot = (mode: LevelBotMode, payload?: SavePayload, videoPlayerState?: PlayerState) => {
        setCoursebotMode(mode);
        if (mode !== 'load') {
            setSavePayload(payload);
            setSavePlayerState(videoPlayerState);
        }
        setCoursebotOpened(true);
    }

    const saveFragmentData = async (payload: SavePayload & {
        title: string;
        slotIndex: number;
    }) => {
        const formData = new FormData();

        formData.append('coursebot__save_fragment', JSON.stringify(payload));

        try {
            const res = await fetch(`/api/elevators/${data.id}`, {
                method: "PUT",
                body: formData,
            });

            const json = await res.json();
            if (json.success) {
                setData(json.lift);
            }
        } catch (error) {
            console.error('ОШИБКА ЗАГРУЗКИ: ', error);
        }
    }

    const autoSaveToCoursebot = async (payload?: SavePayload, playerState?: PlayerState) => {
        if (!payload || !playerState) return;
        const formData = new FormData();

        formData.append('coursebot__autosave', JSON.stringify(payload));
        formData.append('coursebot__autosave--player_state', JSON.stringify(playerState));

        try {
            const res = await fetch(`/api/elevators/${data.id}`, {
                method: "PUT",
                body: formData,
            });

            const json = await res.json();
            if (json.success) {
                setData(json.lift);
            }
        } catch (error) {
            console.error('ОШИБКА ЗАГРУЗКИ: ', error);
        }
    }

    const editFragmentData = async (changes: EditingSlotData, floorId: string, slotId: number) => {
        const formData = new FormData();
        const updates = {
            floorId,
            slotId,
            ...changes,
        };
        formData.append('coursebot__edit_fragment', JSON.stringify(updates));

        try {
            const res = await fetch(`/api/elevators/${data.id}`, {
                method: "PUT",
                body: formData,
            });

            const json = await res.json();
            if (json.success) {
                setData(json.lift);
            }
        } catch (error) {
            console.error('ОШИБКА ЗАГРУЗКИ: ', error);
        }
    }

    const deleteFragmentData = async (slotId: number, floorId: string) => {
        const formData = new FormData();
        const slotData = {
            slotId,
            floorId,
        };
        formData.append('coursebot__delete_fragment', JSON.stringify(slotData));

        try {
            const res = await fetch(`/api/elevators/${data.id}`, {
                method: "PUT",
                body: formData,
            });

            const json = await res.json();
            if (json.success) {
                setData(json.lift);
            }
        } catch (error) {
            console.error('ОШИБКА ЗАГРУЗКИ: ', error);
        }
    }

    const onVideoEnded = async (playerState: PlayerState, id: string) => {
        if (playerState.mode === 'full') {
            const formData = new FormData();
            // const watchData = playerState.watchInfo;
            // alert(JSON.stringify({
            //     ...playerState,
            //     watchInfo: {
            //         ...playerState.watchInfo,
            //         endDate: new Date().toLocaleString().replace(',', ''),
            //     }
            // }));
            formData.append('completed_video_id', id);
            formData.append('video_player_state', JSON.stringify({
                ...playerState,
                watchInfo: {
                    ...playerState.watchInfo,
                    endDate: new Date().toLocaleString().replace(',', ''),
                }
            }));
            try {
                const res = await fetch(`/api/elevators/${data.id}`, {
                    method: "PUT",
                    body: formData,
                });

                const json = await res.json();
                if (json.success) {
                    setData(json.lift);
                }
            } catch (error) {
                console.error('ОШИБКА ЗАГРУЗКИ: ', error);
            }
            onConfirmExitMyLiftPlayer();
        }
    }

    const clearCoursebotAutosave = async (floorId: string) => {
        const formData = new FormData();
        formData.append('coursebot__autosave_clear', floorId);

        try {
            const res = await fetch(`/api/elevators/${data.id}`, {
                method: "PUT",
                body: formData,
            });

            const json = await res.json();
            if (json.success) {
                setData(json.lift);
            }
        } catch (error) {
            console.error('ОШИБКА ЗАГРУЗКИ: ', error);
        }
    }

    const [openingSlotData, setOpeningSlotData] = useState<{
        main: SlotData;
        mode?: MyLiftPlayerMode;
    } | null>(null);
    const [autoSaveData, setAutoSaveData] = useState<AutosaveSlotData | null>(null); // Данные из слота "Автосохранение": больше информации, чем у обычного слота.

    const openSlotInMyLiftPlayer = (slot: SlotData, floorId: string, isAutosave?: boolean, playerMode?: MyLiftPlayerMode) => {
        const targetFloorIndex = data.floors.findIndex(f => f.id === floorId);
        if (targetFloorIndex === -1) return;

        setCoursebotOpened(false);
        // alert(playerMode);
        // if (slot.isAutosave) alert(slot.data.playerState.mode);
        if (targetFloorIndex === currentFloor) {
            if (doorStateRef.current === 'closed') {
                openDoors();
            }
            setOpeningSlotData({
                main: slot,
                mode: playerMode || undefined,
                // mode: playerMode ? playerMode : isAutosave ? "full" : "free",
            });
        } else {
            setIsCoursebotTransit(true);
            setPendingSlotLoad({
                slot,
                floorIndex: targetFloorIndex,
                isAutosave: (isAutosave || false),
                playerMode,
            });

            resetCalls();

            callElevator(targetFloorIndex, 'high');

            if (doorStateRef.current !== 'closed') {
                closeDoors();
            }
        }
    }

    // const [isModeSelectorOpened, setModeSelectorOpened] = useState(false);

    const updateModeSelectorOpened = (val: boolean) => {
        modeSelectorState.current = val;
        setModeSelectorOpened(val);
    }

    const updateExitPlayerModalOpened = (val: boolean) => {
        exitPlayerModalOpened.current = val;
        setExitPlayerModalOpened(val);
    }

    const onConfirmExitMyLiftPlayer = () => {
        resetPlayerRef.current?.();
        updateExitPlayerModalOpened(false);
        closeDoors();
    };

    const onSaveAndExitMyLiftPlayer = () => {
        requestAutosaveRef.current?.();
    }

    const handleInitialPlay = () => {
        updateModeSelectorOpened(true);
    }

    const onSelectPlayMode = (mode: MyLiftPlayerMode) => {
        activatePlayerRef.current?.(mode);
        updateModeSelectorOpened(false);
    }

    useEffect(() => {
        if (isCoursebotTransit && pendingSlotLoad) {
            if (currentFloor === pendingSlotLoad.floorIndex && !isMoving && doorState === 'opened') {

                // const mode = pendingSlotLoad.playerMode ? pendingSlotLoad.playerMode : pendingSlotLoad.isAutosave ? 'full' : 'free';
                const mode = pendingSlotLoad.playerMode ? pendingSlotLoad.playerMode : 'free';
                // alert(pendingSlotLoad.playerMode);
                setOpeningSlotData({
                    main: pendingSlotLoad.slot,
                    mode,
                });
                setPlayerMode(mode);

                setIsCoursebotTransit(false);
                setPendingSlotLoad(null);
            }
        }
    }, [currentFloor, isMoving, doorState, isCoursebotTransit, pendingSlotLoad]);

    useEffect(() => setData(liftData), [liftData]);

    // useEffect(() => {
    //     const videoStats = data.videoStats[videoData?.id || ""];
    //     alert(data.videoStats[videoData?.id || ""]?.views);
    // }, [videoData]);

    // -----------------------------
    // Render
    // -----------------------------
    return (
        <>
            {(url.startsWith('/mylift/elevator')) && <title>{`${data.title}`}</title>}
            {(videoData) && (
                <MyLiftPlayer
                    video={videoData}
                    videoStats={data.videoStats?.[videoData?.id || ""]}
                    liftId={data.id}
                    floorId={data.floors[currentFloor].id}
                    mode={playerMode}
                    onRequestSave={(payload) => openCoursebot('save', payload)}
                    // onRequestAutosave={(payload) => console.log(payload)}
                    onlyFullModeAutosave={(data.coursebot.autosaveInFullModeOnly)}
                    onRequestAutosave={(payload, playerState) => {
                        if (data.coursebot.hiddenAutosave) {
                            autoSaveToCoursebot(payload, playerState);
                        } else openCoursebot('autosave', payload, playerState);
                    }}
                    onRequestLoad={() => openCoursebot('load')}
                    coursebotOptions={data.coursebot}
                    onInitialPlay={handleInitialPlay}
                    updateOpeningSlotData={setOpeningSlotData}
                    onVideoEnded={onVideoEnded}
                    slotDataToOpen={openingSlotData}
                    autoSaveData={autoSaveData}
                    playerStateRef={playerStateRef}
                    activateRef={activatePlayerRef}
                    resetRef={resetPlayerRef}
                    requestAutosaveRef={requestAutosaveRef}
                    styles={{
                        position: 'absolute',
                        // top: '250px',
                        top: `${(((((currentY * 200) + 100) % 200)) - 70)}%`,
                        left: '28.5%',
                        zIndex: '1',
                    }}

                />
            )}
            {/* <MyLiftPlayer
                video={data.floors[0].videoData!}
                liftId={data.id}
                floorId={data.floors[0].id}
                mode="free"
                onRequestSave={(payload) => openCoursebot('save', payload)}
                // onRequestAutosave={(payload) => console.log(payload)}
                onRequestAutosave={(payload) => openCoursebot('autosave', payload)}
                updateOpeningSlotData={setOpeningSlotData}
                slotDataToOpen={openingSlotData}
                autoSaveData={autoSaveData}
                styles={{
                    position: 'absolute',
                    top: '250px',
                    left: 'calc(50% - 340px)',
                    zIndex: '1',
                }}
            /> */}
            <div className={`elevator-video-player ${editMode && "edit-mode"}`}>
                <div
                    className="elevator-video-player__wall left-wall"
                    style={{
                        backgroundImage: `url('${data.elevator.images.walls.left?.url || '/images/elevators/template/MLM-2023/elevator-wall-left.png'}')`,
                        ...data.elevator.images.walls.left?.css,
                    }}
                ></div>

                <div className={`elevator-video-player__doors --${doorType} --${doorOpeningDir}`}>
                    {doorType === 'single' ? (
                        <img
                            src={data.elevator.images.doors.left.url || "/images/elevators/template/MLM-2023/elevator-door.png"}
                            className={`elevator-video-player__door ${doorOpeningDir}-door`}
                            style={{
                                ...data.elevator.images.doors.left.css,
                                translate: `${leftOffsetPx + rightOffsetPx}px 0`
                            }}
                        />
                    ) : (
                        <>
                            <img
                                src={data.elevator.images.doors.left.url || "/images/elevators/template/MLM-2023/elevator-door.png"}
                                className={`elevator-video-player__door left-door `}
                                style={{
                                    ...data.elevator.images.doors.left.css,
                                    translate: `${leftOffsetPx}px 0`
                                }}
                            />
                            <img
                                src={data.elevator.images.doors.right.url || "/images/elevators/template/MLM-2023/elevator-door.png"}
                                className={`elevator-video-player__door right-door`}
                                style={{
                                    ...data.elevator.images.doors.right.css,
                                    translate: `${rightOffsetPx}px 0`
                                }}
                            />
                        </>
                    )}

                </div>

                <div
                    className="elevator-video-player__wall right-wall"
                    style={{
                        backgroundImage: `url('${data.elevator.images.walls.right?.url || '/images/elevators/template/MLM-2023/elevator-wall-right.png'}')`,
                        ...data.elevator.images.walls.right?.css,
                    }}
                >
                    <div
                        className="elevator-video-player__button-panel"
                        style={{
                            backgroundImage: `url('${data.elevator.images.panel.url || '/images/elevators/template/MLM-2023/elevator-buttonpanel-01.png'}')`,
                            ...data.elevator.images.panel.css,
                        }}
                    >
                        {/* Floor buttons */}
                        <div
                            className={`elevator-video-player__button-block floor-buttons ${editMode && editingBlock?.[0] === 0 ? `edit-${editingBlock[1]}` : ""
                                }`}
                            style={{ top: `${data.elevator.buttonPanel.blocks[0].position?.y || 480}px` }}
                            onMouseDown={(e) => onMouseDownBlock(e, 0)}
                            onMouseMove={onMouseMoveBlock}
                            onMouseUp={onMouseUpBlock}
                        >
                            {data.elevator.buttonPanel.blocks[0].buttons.map((button, index) => {
                                const defaultStyles =
                                    button.type !== "empty"
                                        ? typeof button.styles?.default === "string"
                                            ? { backgroundImage: `url('${button.styles.default}')` }
                                            : button.styles.default
                                        : { backgroundImage: undefined };

                                const activeStyles = (button.type !== "empty" && calls.some(call => (button.type === 'floor' && !call.hidden) && call.floor === button.destinationFloor))
                                    ? typeof button.styles?.active === "string"
                                        ? { backgroundImage: `url('${button.styles.active}')` }
                                        : button.styles.active
                                    : {};

                                const styles = {
                                    ...defaultStyles,
                                    ...activeStyles,
                                };

                                const disabled = (button.type === 'floor') ? !validateAccessCondition(button.destinationFloor) : false;

                                return (
                                    <button
                                        key={index}
                                        className={`elevator-video-player__button ${button.type === "empty" ? "empty-button" : ""
                                            } ${activeButton &&
                                                activeButton[0] === 0 &&
                                                activeButton[1] === index
                                                ? "edit-active"
                                                : ""
                                            }`}
                                        disabled={disabled && !editMode}
                                        style={styles as CSSProperties}
                                        onClick={() => onButtonClick(button, index, 0)}
                                    >
                                        {button.type === "floor" && button.showFloorSymbol
                                            ? button.destinationFloor + 1
                                            : ""}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Action buttons */}
                        <div
                            className={`elevator-video-player__button-block action-buttons ${editMode && editingBlock?.[0] === 1 ? `edit-${editingBlock[1]}` : ""
                                }`}
                            style={{ top: `${data.elevator.buttonPanel.blocks[1].position?.y || 550}px` }}
                            onMouseDown={(e) => onMouseDownBlock(e, 1)}
                            onMouseMove={onMouseMoveBlock}
                            onMouseUp={onMouseUpBlock}
                        >
                            {data.elevator.buttonPanel.blocks[1].buttons.map((button, index) => {
                                const styles =
                                    button.type !== "empty"
                                        ? typeof button.styles?.default === "string"
                                            ? { backgroundImage: `url('${button.styles.default}')` }
                                            : button.styles.default
                                        : { backgroundImage: undefined };

                                return (
                                    <button
                                        key={index}
                                        className={`elevator-video-player__button ${button.type === "empty" ? "empty-button" : ""
                                            } ${activeButton &&
                                                activeButton[0] === 1 &&
                                                activeButton[1] === index
                                                ? "edit-active"
                                                : ""
                                            }`}
                                        style={styles as CSSProperties}
                                        onClick={() => onButtonClick(button, index, 1)}
                                    >
                                        {button.type === "action" && button.innerText?.on
                                            ? button.innerText.text
                                            : ""}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Display */}
                        <ElevatorDisplay
                            type={data.elevator.display.type}
                            floor={currentFloor + 1}
                            direction={direction}
                            data={data.elevator.display}
                            styles={{ top: "85.5px" }}
                            inElevator
                            editMode={editMode}
                            isEditing={selectedDisplay !== null}
                            onClick={() => editMode && setSelectedDisplay(data.elevator.display)}
                            options={data.elevator.display.options}
                            doorState={doorState}
                            targetFloor={destinationFloor !== null ? destinationFloor + 1 : null}
                            moveState={moveState}
                        />
                    </div>

                    {editMode ? (
                        <>
                            <ButtonOptionsModal
                                elevator={data}
                                button={activeButton}
                                onSave={onSaveButton}
                                onClose={() => setActiveButton(null)}
                            />

                            <DisplayOptionsModal
                                elevator={data}
                                display={selectedDisplay}
                                onSave={onSaveDisplay}
                                onClose={() => setSelectedDisplay(null)}
                            />
                        </>
                    ) : (
                        <>
                            <PlayModeModal
                                visible={isModeSelectorOpened}
                                onSelect={onSelectPlayMode}
                                onClose={() => updateModeSelectorOpened(false)}
                            />

                            <ConfirmExitModal
                                playerMode={playerStateRef.current?.mode || "free"}
                                visible={isExitPlayerModalOpened}
                                onConfirm={onConfirmExitMyLiftPlayer}
                                onSaveAndExit={onSaveAndExitMyLiftPlayer}
                                onClose={() => updateExitPlayerModalOpened(false)}
                            />
                            {/* Coursebot */}
                            {isCoursebotOpened && (
                                <>
                                    <LevelBotModal
                                        elevator={data}
                                        activeFloorId={data.floors[currentFloor].id}
                                        mode={coursebotMode}
                                        onClose={() => setCoursebotOpened(false)}
                                        onSaveFragment={saveFragmentData}
                                        onAutoSave={(payload) => {
                                            autoSaveToCoursebot(payload, playerStateToSave);
                                            if (isExitPlayerModalOpened && playerStateRef.current?.mode === 'full') {
                                                onConfirmExitMyLiftPlayer();
                                            }
                                        }}
                                        onOverwriteFragment={saveFragmentData}
                                        onClearAutosave={clearCoursebotAutosave}
                                        onEditFragment={editFragmentData}
                                        onDeleteFragment={deleteFragmentData}
                                        onOpenInCoursebotPlayer={() => true}
                                        onOpenInMyLiftPlayer={openSlotInMyLiftPlayer}
                                        savePayload={coursebotSavePayload}
                                    />
                                </>

                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
