import { useRef, useEffect, useState, useCallback } from 'react';
import { ElevatorDirections, LiftJson } from "@/types/elevator";

export interface ElevatorCall {
    floor: number;
    priority: 'high' | 'medium' | 'low';
}

const CallPriorities = { high: 1, medium: 2, low: 3 };

export function useElevatorEngine(
    elevatorData: LiftJson, 
    onFloorReached: (floor: number) => void,
    onPlaySound: (type: 'start' | 'move' | 'end') => void
) {
    // Состояния для UI
    const [displayFloor, setDisplayFloor] = useState(0);
    const [displayDir, setDisplayDir] = useState<ElevatorDirections>("NONE");
    const [translateY, setTranslateY] = useState(0); // В этажах (0.0 - N.0)

    const engineRef = useRef({
        positionY: 0, 
        currentFloor: 0,
        speed: 0,
        direction: 'NONE' as ElevatorDirections,
        destinationFloor: null as number | null,
        calls: [] as ElevatorCall[],
        isMoving: false,
        moveState: '' as 'START' | 'MOVING' | 'END' | '',
    });

    // Настройки из твоего LiftJson
    const motion = elevatorData.elevator.motion;
    const acceleration = 0.03; // Можно вычитать из конфига, если добавишь

    // 1. Логика сортировки и фильтрации "по пути" (Тот самый старый код)
    const sortCalls = useCallback((direction: ElevatorDirections, currentFloor: number) => {
        const state = engineRef.current;
        let dir = direction === 'NONE' ? 'UP' : direction;
        
        state.calls.sort((a, b) => {
            const pDiff = CallPriorities[a.priority] - CallPriorities[b.priority];
            if (pDiff !== 0) return pDiff;
            return (dir === 'UP') ? (a.floor - b.floor) : (b.floor - a.floor);
        });

        // Фильтрация: сначала те, что по пути, потом остальные
        const filtered: ElevatorCall[] = [];
        const removed: ElevatorCall[] = [];
        
        state.calls.forEach(call => {
            const isAhead = (direction === 'DOWN') 
                ? call.floor < (currentFloor + 0.1) 
                : call.floor > (currentFloor - 0.1);
            
            if (isAhead) filtered.push(call);
            else removed.push(call);
        });

        state.calls = [...filtered, ...removed];
    }, []);

    // 2. Добавление вызова
    const callElevator = (floor: number, priority: 'high' | 'medium' | 'low' = 'low') => {
        const state = engineRef.current;
        if (state.calls.some(c => c.floor === floor)) return;
        if (state.currentFloor === floor && !state.isMoving) {
            onFloorReached(floor); // Если уже тут — просто открываем двери
            return;
        }

        state.calls.push({ floor, priority });
        sortCalls(state.direction, state.currentFloor);
        
        if (!state.isMoving) {
            state.destinationFloor = state.calls[0].floor;
        }
    };

    // 3. Цикл физики
    const physicsLoop = useCallback(() => {
        const state = engineRef.current;
        const currentMotion = state.direction === 'DOWN' ? motion.down : motion.up;
        const maxSpeed = 1 / (currentMotion.speedMsPerFloor / 16); // Адаптация скорости к кадрам

        if (state.destinationFloor !== null) {
            const targetY = state.destinationFloor;
            const distance = Math.abs(targetY - state.positionY);

            // Определение направления (detectDirection)
            if (!state.isMoving) {
                if (targetY > state.positionY) state.direction = 'UP';
                else if (targetY < state.positionY) state.direction = 'DOWN';
                
                if (state.direction !== 'NONE') {
                    state.isMoving = true;
                    state.moveState = 'START';
                    onPlaySound('start');
                    setDisplayDir(state.direction);
                }
            }

            // Расчет дистанции торможения (твоя классическая формула)
            const brakingDistance = (state.speed / acceleration) * 1.5;

            if (distance < brakingDistance) {
                // ФАЗА ТОРМОЖЕНИЯ
                if (state.moveState !== 'END') {
                    state.moveState = 'END';
                    onPlaySound('end');
                }

                if (state.speed > 0.005) {
                    state.speed = distance * acceleration;
                } else {
                    // ПРИЕХАЛИ
                    state.speed = 0;
                    state.positionY = targetY;
                    state.isMoving = false;
                    state.moveState = '';
                    const reachedFloor = state.destinationFloor;
                    
                    state.calls.shift(); // Удаляем выполненный
                    state.destinationFloor = state.calls.length > 0 ? state.calls[0].floor : null;
                    
                    if (!state.destinationFloor) {
                        state.direction = 'NONE';
                        setDisplayDir('NONE');
                    }
                    
                    onFloorReached(reachedFloor);
                }
            } else {
                // ФАЗА РАЗГОНА / ДВИЖЕНИЯ
                if (state.speed < maxSpeed) {
                    state.speed += acceleration;
                } else if (state.moveState === 'START') {
                    state.moveState = 'MOVING';
                    onPlaySound('move');
                }
            }

            // Применяем движение
            if (state.isMoving) {
                state.positionY += (state.direction === 'UP') ? state.speed : -state.speed;
                setTranslateY(state.positionY);

                // Обновляем текущий этаж для дисплея
                const realTimeFloor = Math.round(state.positionY);
                if (realTimeFloor !== state.currentFloor) {
                    state.currentFloor = realTimeFloor;
                    setDisplayFloor(realTimeFloor);
                    // Пересортировка на лету при проезде этажа
                    sortCalls(state.direction, state.currentFloor);
                    if (state.calls[0]) state.destinationFloor = state.calls[0].floor;
                }
            }
        }

        // Проверка "Выхода из-под контроля" (как в оригинале!)
        if (state.positionY < -1 || state.positionY > elevatorData.floors.length + 1) {
            console.error("Лифт вышел из-под контроля!!!");
            return; // Останавливаем цикл
        }

        requestAnimationFrame(physicsLoop);
    }, [motion, acceleration, onFloorReached, onPlaySound, sortCalls, elevatorData.floors.length]);

    useEffect(() => {
        const frame = requestAnimationFrame(physicsLoop);
        return () => cancelAnimationFrame(frame);
    }, [physicsLoop]);

    return { displayFloor, displayDir, translateY, callElevator };
}