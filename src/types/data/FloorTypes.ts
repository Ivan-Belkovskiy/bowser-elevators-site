import { VideoData } from "./VideoData";

export type AccessCondition = 
| { type: 'free' }
| { type: 'viewCount'; requiredViews: number; floor: number }
| { type: 'blocked' };

export interface FloorConfig {
    displaySymbol?: string,
    accessCondition?: AccessCondition,
    videoData?: VideoData | null,
}