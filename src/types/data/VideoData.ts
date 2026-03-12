export interface VideoData {
    id: string;
    title: string,
    url: string,
    image?: File | string,
}

export type UpdateVideoDataCallback = (floorIdx: number, data: Partial<VideoData>) => void