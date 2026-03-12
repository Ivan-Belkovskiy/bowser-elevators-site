import { useState, useRef, useEffect, useCallback } from 'react';

export function useSimpleElevator(floor: number, targetFloor: number) {
    const [currentFloor, setCurrentFloor] = useState(floor);
    const [currentY, setCurrentY] = useState(0); // Текущая координата в этажах (дробная)

    // Используем Ref для физики, чтобы не вызывать ререндер на каждом расчете
    const state = useRef({
        pos: 0,
        vel: 0, // Скорость (этажей в кадр)
        accel: 0.0001, // Ускорение
        maxVel: 0.0055, // Макс. скорость (дает ~2 сек на этаж)
        brakingDist: 0.2, // Дистанция начала торможения (в этажах)
        currentFloor,
        // pos: 0,
        // vel: 0, // Скорость (этажей в кадр)
        // accel: 0.0002, // Ускорение
        // maxVel: 0.0083, // Макс. скорость (дает ~2 сек на этаж)
        // brakingDist: 0.4, // Дистанция начала торможения (в этажах)
        // currentFloor,
    });

    useEffect(() => {
        let frameId: number;

        const loop = () => {
            const s = state.current;
            const distance = targetFloor - s.pos;
            const absDist = Math.abs(distance);

            if (absDist > 0.001) {
                // 1. Определение желаемой скорости
                // Если мы близко к цели (меньше brakingDist), замедляемся пропорционально расстоянию
                const desiredVel = absDist < s.brakingDist
                    ? (absDist / s.brakingDist) * s.maxVel
                    : s.maxVel;

                // 2. Плавное изменение текущей скорости до желаемой (разгон/торможение)
                if (s.vel < desiredVel) {
                    s.vel = Math.min(s.vel + s.accel, desiredVel);
                } else {
                    s.vel = Math.max(s.vel - s.accel, desiredVel);
                }

                // 3. Движение
                const direction = distance > 0 ? 1 : -1;
                s.pos += s.vel * direction;
                // console.log('POSITION: ' + s.pos);
                setCurrentY(s.pos);
                frameId = requestAnimationFrame(loop);
            } else {
                // Полная остановка
                s.pos = targetFloor;
                s.vel = 0;
                setCurrentY(s.pos);
            }
            s.currentFloor = Math.round(s.pos);
            setCurrentFloor(s.currentFloor + 0);
        };

        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }, [targetFloor]);

    return { currentY, currentFloor };
}