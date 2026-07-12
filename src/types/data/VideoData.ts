export type VideoData = {
    myLiftV2Update: true;
    
    title: string;
    videoList: {
        id: string;
        title?: string, // При отсутствии названия в списке будет отображаться "Видео {номер}"
        url: string,
        image?: File | string,
    }[];
    
} | {
    myLiftV2Update?: false;
    id: string;
    title: string,
    url: string,
    image?: File | string,
}

export interface VideoDataV1 {
    id: string;
    title?: string,
    url: string,
    image?: File | string,
}

export const getVideoData = (data?: VideoData | null, videoIdx?: number /* For V2 */) => {
    if (!data) return undefined;
    if (data.myLiftV2Update) {
        return data.videoList[videoIdx || 0];
    } else {
        return data;
    }
}

export type UpdateVideoDataCallback = (floorIdx: number, data: Partial<VideoData>) => void