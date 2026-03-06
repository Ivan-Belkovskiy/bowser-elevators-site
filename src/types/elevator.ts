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

export interface ElevatorDisplayConfig { // Настройки табло индикации //
  type: ElevatorDisplayTypes; // Вид табло
  options: Record<string, string | number | boolean>; // Настраиваемые параметры табло //
}

export interface SlotData {
  id: string;
  title: string;
  createdAt: string;
  timecodeMs: number;
  thumbnailUrl?: string;
  videoUrl?: string;
}


export interface LiftJson {
  id: string;
  title: string;
  description: string;

  floors: Floor[];

  coursebot: {
    enabled: boolean;
    autosaveDelaySec: number;
    hiddenAutosave: boolean;
    slots: {
      [floorId: string]: {
        autosave?: SlotData;
        fragments: SlotData[];
      };
    };
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
      doors: {
        left: { url: string | null; css?: CSSProperties };
        right: { url: string | null; css?: CSSProperties };
      };
      walls: { url: string | null; css?: CSSProperties };
      panel: { url: string | null; css?: CSSProperties };
    };

    doorConfig: {
      type: "central" | "telescopic" | "single";
      direction: "left" | "right" | null;
      animation: {
        durationMs: number;
        keyframes: {
          time: number;
          leftDoorX: number;
          rightDoorX: number;
        }[];
      };
    };

    motion: {
      preDelayMs: number;
      accelMs: number;
      speedMsPerFloor: number;
      decelMs: number;
      postDelayMs: number;
    };

    display: ElevatorDisplayConfig;

    buttonPanel: {
      blocks: ButtonBlock[];
    };
  };

  meta: {
    createdAt: string;
    updatedAt?: string;
    version: number;
  };
}



export type ElevatorDisplayTypes = 'MLMLCD' | 'TIM2' | "7SEGMENT_NEW";

export type ElevatorDirections = "UP" | "DOWN" | "NONE";