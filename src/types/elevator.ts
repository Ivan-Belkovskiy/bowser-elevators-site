import { ActionParam } from "@/constants/elements";
import { CSSProperties } from "react";
import { AccessCondition } from "./data/FloorTypes";
import { VideoData } from "./data/VideoData";

export interface Floor {
  id: string;
  displaySymbol: string;
  accessCondition?: AccessCondition;
  videoData?: VideoData;
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
  id: number;
  empty: boolean;
  title?: string;
  createdAt?: string;
  timecode?: number;
  thumbnailUrl?: string;
  videoUrl?: string;
}

export interface DoorKeyframe {
  time: number;
  leftDoorX: number;
  rightDoorX: number;
}

export interface DoorAnimationConfig {
  durationMs: number;
  curve: "linear" | "ease-in" | "ease-out" | "ease-in-out";
  keyframes: DoorKeyframe[];
}

export interface CoursebotFloorSlotConfig {
  autosave?: SlotData;
  fragments: SlotData[];
};


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
      [floorId: string]: CoursebotFloorSlotConfig;
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
      animations: {
        open: DoorAnimationConfig;
        close: DoorAnimationConfig;
      };
    }



    motion: {
      up: {
        preDelayMs: number;
        accelMs: number;
        speedMsPerFloor: number;
        decelMs: number;
        postDelayMs: number;
        curve: "linear" | "ease-in" | "ease-out" | "ease-in-out";
      };
      down: {
        preDelayMs: number;
        accelMs: number;
        speedMsPerFloor: number;
        decelMs: number;
        postDelayMs: number;
        curve: "linear" | "ease-in" | "ease-out" | "ease-in-out";
      };
    }


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


export type ElevatorDoorTypes = "central" | "telescopic" | "single";

export type ElevatorDoorOpenDirections = "left" | "right" | null;

export type ElevatorDisplayTypes = 'MLMLCD' | 'TIM2' | "7SEGMENT_NEW";

export type ElevatorDirections = "UP" | "DOWN" | "NONE";