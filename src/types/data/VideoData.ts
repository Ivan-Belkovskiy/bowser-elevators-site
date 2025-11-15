export interface VideoData {
    title: string,
    url: string,
    image?: File,
}

export type UpdateVideoDataCallback = (floorIdx: number, data: Partial<VideoData>) => void