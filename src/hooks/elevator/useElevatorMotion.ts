import { useState, useRef, useEffect, useCallback } from 'react';
import { LiftJson, ElevatorDirections } from "@/types/elevator";

export function useElevatorMotion(elevatorData: LiftJson, onReachedFloor: (floor: number) => void) {
    const [currentFloor, setCurrentFloor] = useState(0);
    const [displayDir, setDisplayDir] = useState<ElevatorDirections>("NONE");
    const [translateY, setTranslateY] = useState(0); // Для движения плеера

    const stateRef = useRef({
        isMoving: false,
        currentFloor: 0,
        queue: [] as number[],
        position: 0, // 0.0 - 1.0 внутри одного этажа или глобально
    });

    const motionParams = elevatorData.elevator.motion;

    // Твоя функция расчета позиции из Modal, адаптированная под глобальный масштаб
    const computeStep = (progress: number, p: any) => {
        const t_pre = p.preDelayMs, t_acc = p.accelMs, t_con = p.speedMsPerFloor, t_dec = p.decelMs;
        const totalMs = t_pre + t_acc + t_con + t_dec + p.postDelayMs;
        const ms = progress * totalMs;

        if (ms <= t_pre) return 0;
        const effectiveTime = 0.5 * t_acc + t_con + 0.5 * t_dec;
        if (effectiveTime === 0) return 1;

        const vMax = 1 / effectiveTime; // Макс скорость в "долях этажа" в мс
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

    const moveToOneFloor = async (from: number, to: number) => {
        const direction: ElevatorDirections = to > from ? "UP" : "DOWN";
        const params = direction === "UP" ? motionParams.up : motionParams.down;
        const totalTime = params.preDelayMs + params.accelMs + params.speedMsPerFloor + params.decelMs + params.postDelayMs;
        
        setDisplayDir(direction);
        
        return new Promise<void>((resolve) => {
            const start = performance.now();
            const animate = (now: number) => {
                const elapsed = now - start;
                const progress = Math.min(1, elapsed / totalTime);
                
                // Рассчитываем локальный сдвиг (0...1)
                const step = computeStep(progress, params);
                
                // Рассчитываем глобальную позицию Y для CSS
                // Если едем вверх (UP), translateY увеличивается (тянем фон вниз)
                const currentGlobalPos = direction === "UP" ? from + step : from - step;
                
                setTranslateY(currentGlobalPos);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    stateRef.current.currentFloor = to;
                    setCurrentFloor(to);
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });
    };

    const processQueue = useCallback(async () => {
        if (stateRef.current.isMoving || stateRef.current.queue.length === 0) return;

        stateRef.current.isMoving = true;
        const targetFloor = stateRef.current.queue[0];
        const startFloor = stateRef.current.currentFloor;

        if (targetFloor !== startFloor) {
            // Если едем через несколько этажей, вызываем moveToOneFloor по очереди
            const diff = Math.abs(targetFloor - startFloor);
            const step = targetFloor > startFloor ? 1 : -1;

            for (let i = 1; i <= diff; i++) {
                const nextStepFloor = startFloor + (i * step);
                await moveToOneFloor(stateRef.current.currentFloor, nextStepFloor);
            }
        }

        stateRef.current.queue.shift();
        stateRef.current.isMoving = false;
        setDisplayDir("NONE");
        onReachedFloor(targetFloor);
        
        if (stateRef.current.queue.length > 0) processQueue();
    }, [motionParams, onReachedFloor]);

    const addToQueue = (floor: number) => {
        if (!stateRef.current.queue.includes(floor)) {
            stateRef.current.queue.push(floor);
            processQueue();
        }
    };

    return { translateY, currentFloor, displayDir, addToQueue };
}