import { VideoData } from "@/types/data/VideoData";
import React, {
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef
} from "react";

interface VideoElementProps {
  video: VideoData;
  playerState: any;
  setPlayerState: (fn: any) => void;
}

const VideoElement = forwardRef<HTMLVideoElement, VideoElementProps>(
  ({ video, playerState, setPlayerState }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

    useEffect(() => {
      const el = videoRef.current;
      if (!el) return;
      if (playerState.playing) {
        el.play().catch(() => {});
      } else {
        el.pause();
      }
    }, [playerState.playing]);

    useEffect(() => {
      if (videoRef.current) videoRef.current.volume = playerState.volume;
    }, [playerState.volume]);

    useEffect(() => {
      const el = videoRef.current;
      if (!el || !playerState.activated) return;
      if (Math.abs(el.currentTime - playerState.currentTime) > 0.5) {
        el.currentTime = playerState.currentTime;
      }
    }, [playerState.currentTime]);

    return (
      <video
        ref={videoRef}
        style={{ width: '100%' }}
        src={`/api/video?path=${encodeURIComponent(video.url)}`}
        poster={video.image as string}
        className="mylift-video"
        playsInline
        preload="auto"
        onContextMenu={(e) => e.preventDefault()}
        
        onLoadedMetadata={(e) => {
          const el = e.currentTarget;
          setPlayerState((prev: any) => ({
            ...prev,
            duration: el.duration,
            loading: false
          }));
        }}
        
        onTimeUpdate={(e) => {
          const time = e.currentTarget.currentTime;
          setPlayerState((prev: any) => ({
            ...prev,
            currentTime: time
          }));
        }}
        
        onEnded={() => {
          setPlayerState((prev: any) => ({
            ...prev,
            playing: false,
            ended: true
          }));
        }}
      />
    );
  }
);

export default VideoElement;