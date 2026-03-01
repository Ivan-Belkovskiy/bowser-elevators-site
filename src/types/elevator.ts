import { ActionParam } from "@/constants/elements";
import { CSSProperties } from "react";

export interface Floor {
  id: string;
  displaySymbol: string;
  videoData?: {
    title: string;
    image?: string;
    url?: string;
  };
}

export interface ElevatorButtonStyles {
  default: string | Partial<CSSStyleDeclaration>;
  active: string | Partial<CSSStyleDeclaration>;
};

export type ElevatorButton = {
  type: "floor";
  destinationFloor: number;
  blocked: boolean;
  styles: ElevatorButtonStyles;
  showFloorSymbol?: boolean;
} | {
  type: "action";
  action: {
    element: string;
    command: string;
    params?: Record<string, any>,
  };
  blocked: boolean;
  styles: ElevatorButtonStyles;
  deletable: boolean;
  innerText?: {
    on: boolean;
    text: string;
  };
} | {
  type: "empty",
};

export interface ButtonBlock {
  type: "floors" | "actions";
  // rows: number; // Убрал rows для автоматической подстройки рядов относительно количества кнопок
  cols: number;
  buttons: ElevatorButton[];
  position: {
    y: number;
  };
  customPosition?: {
    x?: number;
    y?: number;
  };
}

export interface LiftJson {
  id: string;
  title: string;
  description: string;
  floors: Floor[];
  coursebot: {
    enabled: boolean;
    options: {}; // Настройки Уровнебота (такие, как скрытое автосохранение, время после паузы для активации автосохранения)
  };
  elevator: {
    soundEffects: {
      doorOpen: string | null;
      doorClose: string | null;
      buttonClick: string | null;
      movement: {
        start: string | null;
        move: string | null;
        end: string | null;
      };
    };
    images: {
      doors: { left: string | null; right: string | null };
      walls: string | null;
      panel: string | null;
    };
    doorConfig: {
      type: "central" | "telescopic" | "single"; // Тип дверей (центрального открывания, телескопические, однодверные)
      direction: "left" | "right" | null; // Направление открытия дверей (для центрального открывания = null)
      animation: {}; // Настройка анимации дверей: Я планирую, чтобы можно было самому редактировать анимации. Редактор анимации я предлагаю сделать как в Blender 3D (по ключевым кадрам, например, 0 сек (начало) = положение дверей 0 (закрыто) | 1 сек (финал) = положение дверей 1 (открыто))
    };
    display: { // Настройки табло индикации //
      type: ElevatorDisplayTypes; // Вид табло
      options: Record<string, string | number | boolean >; // Настраиваемые параметры табло //
      allowedOptions: string[];
    };
    buttonPanel: {
      blocks: ButtonBlock[];
    };
  };
}


export type ElevatorDisplayTypes = 'MLMLCD' | 'TIM2';

export type ElevatorDirections = "UP" | "DOWN" | "NONE";