export type AccessCondition = 
| { type: 'free' }
| { type: 'viewCount'; requiredViews: number; floor: number }
| { type: 'blocked' };

export interface FloorConfig {
    floorNumber: number,
    displaySymbol?: string,
    accessCondition?: AccessCondition,
    videoUrl?: string,
    thumbnail?: string,
}