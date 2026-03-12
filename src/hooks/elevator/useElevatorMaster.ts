import { useState, useRef, useEffect, useCallback } from 'react';
import { LiftJson, ElevatorDirections } from "@/types/elevator";

export function useElevatorMaster(elevatorData: LiftJson, onReachedFloor: (floor: number) => void) {
    // Состояния для UI (дисплей и позиция видео)
    const [displayFloor, setDisplayFloor] = useState(0);
    const [displayDir, setDisplayDir] = useState<ElevatorDirections>("NONE");
    const [translateY, setTranslateY] = useState(0);

    const stateRef = useRef({
        isMoving: false,
        currentFloor: 0,
        queue: [] as number[],
        positionY: 0, // Глобальная позиция (дробное число этажей)
    });

    const motionParams = elevatorData.elevator.motion;

    // Математическая функция расчета шага (из твоего редактора)
    const computeStep = (progress: number, p: any) => {
        const t_pre = p.preDelayMs, t_acc = p.accelMs, t_con = p.speedMsPerFloor, t_dec = p.decelMs;
        const totalMs = t_pre + t_acc + t_con + t_dec + p.postDelayMs;
        const ms = progress * totalMs;

        if (ms <= t_pre) return 0;
        const effectiveTime = 0.5 * t_acc + t_con + 0.5 * t_dec;
        if (effectiveTime === 0) return 1;

        const vMax = 1 / effectiveTime;
        const d_acc = 0.5 * vMax * t_acc;
        const d_con = d_acc + vMax * t_con;
        const ms_active = ms - t_pre;

        if (ms_active <= t_acc) return 0.5 * (vMax / t_acc) * (ms_active ** 2);
        if (ms_active <= t_acc + t_con) return d_acc + vMax * (ms_active - t_acc);
        if (ms_active <= t_acc + t_con + t_dec) {
            const ms_dec = ms_active - t_acc - t_con;
            return d_con + (vMax * ms_dec) - (0.5 * (vMax / t_dec) * (ms_dec ** 2));
        }
        return 1;
    };

    // Анимация перемещения между ДВУМЯ соседними этажами
    const moveBetweenFloors = async (from: number, to: number) => {
        const direction: ElevatorDirections = to > from ? "UP" : "DOWN";
        const params = direction === "UP" ? motionParams.up : motionParams.down;
        const totalTime = params.preDelayMs + params.accelMs + params.speedMsPerFloor + params.decelMs + params.postDelayMs;
        
        setDisplayDir(direction);

        return new Promise<void>((resolve) => {
            const start = performance.now();
            const animate = (now: number) => {
                const elapsed = now - start;
                const progress = Math.min(1, elapsed / totalTime);
                
                const step = computeStep(progress, params);
                // Плавно меняем глобальную координату
                const currentGlobalPos = direction === "UP" ? from + step : from - step;
                
                setTranslateY(currentGlobalPos);
                
                // Обновляем номер этажа на табло в середине пути
                const midFloor = Math.round(currentGlobalPos);
                if (midFloor !== stateRef.current.currentFloor) {
                    setDisplayFloor(midFloor);
                }

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    stateRef.current.currentFloor = to;
                    setDisplayFloor(to);
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });
    };

    // Процессор очереди
    const processQueue = useCallback(async () => {
        if (stateRef.current.isMoving || stateRef.current.queue.length === 0) return;

        stateRef.current.isMoving = true;
        
        while (stateRef.current.queue.length > 0) {
            const targetFloor = stateRef.current.queue[0];
            const startFloor = stateRef.current.currentFloor;

            if (targetFloor !== startFloor) {
                const diff = Math.abs(targetFloor - startFloor);
                const step = targetFloor > startFloor ? 1 : -1;

                // Поэтапное движение через все этажи
                for (let i = 1; i <= diff; i++) {
                    const nextStepFloor = startFloor + (i * step);
                    await moveBetweenFloors(stateRef.current.currentFloor, nextStepFloor);
                }
            }

            // Приехали на целевой этаж
            stateRef.current.queue.shift();
            setDisplayDir("NONE");
            onReachedFloor(stateRef.current.currentFloor);
            
            // Небольшая пауза, чтобы двери успели открыться/закрыться (closeDelay из LiftJson)
            await new Promise(r => setTimeout(r, 500)); 
            
            // Если за время стоянки добавились новые вызовы — продолжаем цикл while
        }

        stateRef.current.isMoving = false;
    }, [motionParams, onReachedFloor]);

    const callElevator = (floor: number) => {
        if (stateRef.current.queue.includes(floor)) return;
        stateRef.current.queue.push(floor);
        // Сортировка очереди (опционально, можно добавить твою логику ElevatorCallPriorities)
        processQueue();
    };

    return { translateY, displayFloor, displayDir, callElevator };
}