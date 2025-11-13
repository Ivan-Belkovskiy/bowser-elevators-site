export interface VideoData {
    title: string,
    url: string,
    image?: string,
}

export type UpdateVideoDataCallback = (floorIdx: number, data: Partial<VideoData>) => void