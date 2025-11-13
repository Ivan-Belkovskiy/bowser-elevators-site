import { VideoData } from "@/types/data/VideoData";
import { FloorConfig } from "@/types/data/FloorTypes";

export interface VideoSettingsModalProps {
  floor: FloorConfig;
  idx: number;
  updateVideoData?: (floorIdx: number, value: Partial<VideoData>) => void;
  onClose: () => void;
}
