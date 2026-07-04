import { ElevatorDoorState } from '@/components/ElevatorVideoPlayer/ElevatorVideoPlayer';
import AudioController from '@/core/audio/AudioController';
import { ElevatorDirections, LiftJson } from '@/types/elevator';
import { useState, useRef, useEffect, useCallback } from 'react';

export type ElevatorCallPriority = "high" | "medium" | "low";

export interface ElevatorCall {
    floor: number;
    priority: ElevatorCallPriority;
    hidden?: boolean;
}

export interface ElevatorControlData {
    doorState: ElevatorDoorState;
    openDoors: () => void;
    closeDoors: () => void;
}

export type ElevatorMoveState = "START" | "MOVE" | "END" | "";

const CallPriorities = { high: 1, medium: 2, low: 3 };

export function useElevator(floor: number, elevatorData: LiftJson, controlData: ElevatorControlData) {
    const [currentFloor, setCurrentFloor] = useState(floor - 1);
    const [targetFloor, setTargetFloor] = useState<number | null>(null);
    const [direction, setDirection] = useState<ElevatorDirections>("NONE");
    const [calls, setCalls] = useState<ElevatorCall[]>([]);
    const [isMoving, setMovingState] = useState(false);
    const [moveState, setMoveState] = useState<ElevatorMoveState>("");
    const [currentY, setCurrentY] = useState(0);

    const control = useRef(controlData);

    useEffect(() => {
        control.current = controlData;
    }, [controlData]);

    const state = useRef({
        pos: 0,
        vel: 0,
        accel: 0.0001,
        maxVel: 0.0055,
        brakingDist: 0.2,
        currentFloor,
        direction: "NONE" as ElevatorDirections,
        calls: [] as ElevatorCall[],
        destinationFloor: null as number | null,
        isMoving: false,
        moveState: "" as ElevatorMoveState,
        delay: 0,
        nextAction: null as string | null,
    });

    const callElevator = (floor: number, priority?: ElevatorCallPriority) => {
        const lift = state.current;
        if (lift.calls.some(c => c.floor === floor)) return;
        if (lift.currentFloor === floor && !lift.isMoving) {
            // onFloorReached(floor);
            return;
        }
        lift.calls.push({
            floor,
            priority: priority || "low",
        });

        filterCalls(lift.direction, lift.currentFloor);

        if (!lift.isMoving) {
            // lift.destinationFloor = lift.calls[0].floor;
            updateTargetFloor(lift);
            calculateDirection(lift.currentFloor, lift.calls[0]?.floor);
            // setTargetFloor(lift.destinationFloor);
            // alert(state.current.destinationFloor);
        }
    }

    const filterCalls = useCallback((direction: ElevatorDirections, currentFloor: number) => {
        const lift = state.current;
        let dir = direction === 'NONE' ? 'UP' : direction;

        lift.calls.sort((a, b) => {
            const pDiff = CallPriorities[a.priority] - CallPriorities[b.priority];
            if (pDiff !== 0) return pDiff;
            return (dir === 'UP') ? (a.floor - b.floor) : (b.floor - a.floor);
        });

        const filtered: ElevatorCall[] = [];
        const removed: ElevatorCall[] = [];

        lift.calls.forEach(call => {
            const isAhead = (direction === 'DOWN')
                ? call.floor < (currentFloor + 0.1)
                : call.floor > (currentFloor - 0.1);

            if (isAhead) filtered.push(call);
            else removed.push(call);
        });

        lift.calls = [...filtered, ...removed];
        setCalls(lift.calls);
    }, []);

    const updateTargetFloor = (s: typeof state.current) => {
        filterCalls(s.direction, s.pos);
        if (targetFloor !== s.calls[0]?.floor) setTargetFloor(s.calls[0]?.floor);
    }

    const updateDirection = (s: typeof state.current, value: ElevatorDirections) => {
        s.direction = value;
        setDirection(value);
    }

    const calculateDirection = (currentFloor: number, destinationFloor: number) => {
        const s = state.current;
        if (currentFloor == destinationFloor) {
            updateDirection(s, "NONE");
        } else if (currentFloor > destinationFloor) {
            updateDirection(s, "DOWN");
        } else if (currentFloor < destinationFloor) {
            updateDirection(s, "UP");
        }
        // setDirection(s.direction);

        // setTimeout(() => {
        //     if (s.direction !== "NONE") AudioController.playDirectionNotification(s.direction);
        // }, 1200);

        // s.displayDir = s.direction;
    }

    const setIsMoving = (lift: typeof state.current, value: boolean) => {
        setMovingState(value);
        lift.isMoving = value;
    }

    const resetCalls = useCallback(() => {
        const s = state.current;

        if (!s.isMoving || s.direction === "NONE") {
            s.calls = [];
            setCalls([]);
            setTargetFloor(null);
            updateDirection(s, "NONE");
            return;
        }

        let stopFloor = s.direction === "UP" ? Math.ceil(s.pos) : Math.floor(s.pos);

        const distToFloor = Math.abs(stopFloor - s.pos);
        if (distToFloor < s.brakingDist) {
            stopFloor = s.direction === "UP" ? stopFloor + 1 : stopFloor - 1;
        }

        s.calls = [{
            floor: stopFloor,
            priority: "high",
            hidden: true,
        }];

        setCalls(s.calls);
        setTargetFloor(stopFloor);

    }, [updateDirection]);

    useEffect(() => {
        let frameId: number;
        const loop = () => {
            const s = state.current;
            if (s.delay > 0) {
                s.delay -= 1;
                frameId = requestAnimationFrame(loop);
                return;
            }
            if (s.nextAction) {
                if (s.nextAction === 'openDoors') {
                    control.current.openDoors();
                    s.moveState = "";
                    setMoveState("");
                    setIsMoving(s, false);
                }
                frameId = requestAnimationFrame(loop);
                s.nextAction = null;
                s.delay = 2; //
                return;
            }
            if (control.current.doorState !== 'closed') {
                frameId = requestAnimationFrame(loop);
                return;
            }
            const movementConfig = (s.direction === 'UP') ? elevatorData.elevator.motion.up : elevatorData.elevator.motion.down;
            updateTargetFloor(s);
            if (targetFloor == null) return;
            if (!s.isMoving && state.current.moveState !== "START") {
                AudioController.playMovementStart(elevatorData.elevator.soundEffects.movement.start || "");
                s.delay = (movementConfig.preDelayMs / 16.66666666666667);
                state.current.moveState = "START";
                setMoveState("START");
                setIsMoving(s, true);
            }
            const distance = targetFloor - s.pos;
            const absDist = Math.abs(distance);

            if (absDist > 0.001) {
                if (AudioController.movementStart && ((AudioController.movementStart.currentTime > (AudioController.movementStart.duration - 0.12)) || absDist < s.brakingDist)) {
                    if (absDist > s.brakingDist) {
                        if (s.moveState !== "MOVE" || s.vel === s.maxVel) {

                            AudioController.playMovementLoop(elevatorData.elevator.soundEffects.movement.move || "")?.then(() => {

                            });
                            // if (AudioController.movementLoop && AudioController.movementLoop.currentTime > 0.03) {
                            // AudioController.movementStart.pause();
                            // AudioController.movementStart.currentTime = 0;
                            // alert(AudioController.movementStart.currentTime)
                            // }
                            s.moveState = "MOVE";
                            setMoveState("MOVE");
                        }
                    } else {
                        if (s.moveState !== "END") {
                            AudioController.playMovementEnd(elevatorData.elevator.soundEffects.movement.end || "")?.then(() => {
                                if (AudioController.movementStart) {
                                    AudioController.movementStart.pause();
                                    AudioController.movementStart.currentTime = 0;
                                }
                                AudioController.stopMovementLoop();
                            });
                            if (s.direction !== "NONE" && s.calls.length <= 1) updateDirection(s, "NONE");
                            s.moveState = "END";
                            setMoveState("END");
                        }
                    }
                }

                const desiredVel = absDist < s.brakingDist
                    ? (absDist / s.brakingDist) * s.maxVel
                    : s.maxVel;


                if (s.vel < desiredVel) {
                    s.vel = Math.min(s.vel + s.accel, desiredVel);
                    // s.moveState = "START";
                } else {
                    s.vel = Math.max(s.vel - s.accel, desiredVel);
                    // s.moveState = "END";
                }

                const direction = distance > 0 ? 1 : -1;
                s.pos += s.vel * direction;
                setCurrentY(s.pos);
                frameId = requestAnimationFrame(loop);
            } else {
                s.pos = targetFloor;
                s.vel = 0;
                s.calls.shift();
                setCurrentY(s.pos);

                calculateDirection(s.currentFloor, s.calls[0]?.floor);
                s.delay = (movementConfig.postDelayMs / 16.66666666666667);
                s.nextAction = 'openDoors';
                updateTargetFloor(s);
                if (s.direction === "NONE") {
                    setIsMoving(s, false);
                    setTargetFloor(null);
                }
                // alert(JSON.stringify(s.calls));
                // if (!targetFloor){
                //     if (s.direction === 'UP') s.direction = 'DOWN'; else s.direction = 'UP';
                //     updateTargetFloor(s);
                // }
            }
            s.currentFloor = Math.round(s.pos);
            setCurrentFloor(s.currentFloor + 0);
        };

        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }, [targetFloor]);

    return { currentY, currentFloor, calls, direction, isMoving, callElevator, resetCalls, destinationFloor: targetFloor, moveState };
}