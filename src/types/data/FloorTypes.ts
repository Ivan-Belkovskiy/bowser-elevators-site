import { VideoData } from "./VideoData";

export type AccessCondition = 
| { type: 'free' }
| { type: 'viewCount'; requiredViews: number; floor: number }
| { type: 'blocked' };

export interface FloorConfig {
    floorNumber: number,
    displaySymbol?: string,
    accessCondition?: AccessCondition,
    videoData?: VideoData | null,
    // videoTitle?: string,
    // videoUrl?: string,
    // thumbnail?: string,
}