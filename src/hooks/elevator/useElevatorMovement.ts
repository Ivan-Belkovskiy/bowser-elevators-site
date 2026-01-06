import { useEffect, useState } from "react";

type Direction = "UP" | "DOWN" | "NONE";
type DoorState = "OPENED" | "CLOSED" | "OPENING" | "CLOSING";

interface ElevatorState {
  currentFloor: number;
  destinationFloor: number | null;
  direction: Direction;
  doorState: DoorState;
  isMoving: boolean;
  positionY: number;
}

export function useElevatorMovement({
  minFloor = 0,
  maxFloor = 10,
  floorHeight = 100,
  speed = 1.0,
  autoCloseDelay = 4000,
}: {
  minFloor?: number;
  maxFloor?: number;
  floorHeight?: number;
  speed?: number;
  autoCloseDelay?: number;
}) {
  const [state, setState] = useState<ElevatorState>({
    currentFloor: minFloor,
    destinationFloor: null,
    direction: "NONE",
    doorState: "CLOSED",
    isMoving: false,
    positionY: minFloor * floorHeight,
  });

  // Вызов лифта
  const callElevator = (floor: number) => {
    if (floor < minFloor || floor > maxFloor) return;
    if (state.isMoving) return;

    setState((prev) => ({
      ...prev,
      destinationFloor: floor,
      direction:
        floor > prev.currentFloor ? "UP" : floor < prev.currentFloor ? "DOWN" : "NONE",
      isMoving: floor !== prev.currentFloor,
    }));
  };

  // Движение лифта
  useEffect(() => {
    if (state.isMoving && state.destinationFloor !== null) {
      const interval = setInterval(() => {
        setState((prev) => {
          let nextY = prev.positionY;
          const targetY = state.destinationFloor! * floorHeight;

          // Двигаем кабину
          if (prev.direction === "UP") nextY += speed * 5;
          if (prev.direction === "DOWN") nextY -= speed * 5;

          // Проверяем, проехали ли новый этаж
          const passedFloor = Math.round(nextY / floorHeight);
          if (passedFloor !== prev.currentFloor) {
            return { ...prev, positionY: nextY, currentFloor: passedFloor };
          }

          // Достигли целевого этажа
          if (
            (prev.direction === "UP" && nextY >= targetY) ||
            (prev.direction === "DOWN" && nextY <= targetY)
          ) {
            return {
              ...prev,
              positionY: targetY,
              currentFloor: state.destinationFloor!,
              isMoving: false,
              direction: "NONE",
              doorState: "OPENING",
            };
          }

          return { ...prev, positionY: nextY };
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [state.isMoving, state.destinationFloor, state.direction]);

  // Управление дверями
  useEffect(() => {
    if (state.doorState === "OPENING") {
      const timer = setTimeout(() => {
        setState((prev) => ({ ...prev, doorState: "OPENED" }));
        setTimeout(() => {
          setState((prev) => ({ ...prev, doorState: "CLOSING" }));
          setTimeout(() => {
            setState((prev) => ({ ...prev, doorState: "CLOSED" }));
          }, 2000);
        }, autoCloseDelay);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.doorState]);

  return { state, callElevator };
}
