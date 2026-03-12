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

    // -----------------------------------
    // Expose <video> to parent via ref
    // -----------------------------------
    useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

    // -----------------------------------
    // Load metadata (duration)
    // -----------------------------------
    useEffect(() => {
      const el = videoRef.current;
      if (!el) return;

      const onLoaded = () => {
        setPlayerState((s: any) => ({
          ...s,
          duration: el.duration,
          loading: false
        }));
      };

      el.addEventListener("loadedmetadata", onLoaded);
      return () => el.removeEventListener("loadedmetadata", onLoaded);
    }, []);

    // -----------------------------------
    // Update currentTime
    // -----------------------------------
    useEffect(() => {
      const el = videoRef.current;
      if (!el) return;

      const onTime = () => {
        setPlayerState((s: any) => ({
          ...s,
          currentTime: el.currentTime
        }));
      };

      el.addEventListener("timeupdate", onTime);
      return () => el.removeEventListener("timeupdate", onTime);
    }, []);

    // -----------------------------------
    // Handle ended
    // -----------------------------------
    useEffect(() => {
      const el = videoRef.current;
      if (!el) return;

      const onEnded = () => {
        setPlayerState((s: any) => ({
          ...s,
          playing: false,
          ended: true
        }));
      };

      el.addEventListener("ended", onEnded);
      return () => el.removeEventListener("ended", onEnded);
    }, []);

    // -----------------------------------
    // Sync play/pause with state
    // -----------------------------------
    useEffect(() => {
      const el = videoRef.current;
      if (!el) return;

      if (playerState.playing) {
        el.play().catch(() => {});
      } else {
        el.pause();
      }
    }, [playerState.playing]);

    // -----------------------------------
    // Sync volume
    // -----------------------------------
    useEffect(() => {
      const el = videoRef.current;
      if (!el) return;

      el.volume = playerState.volume;
    }, [playerState.volume]);

    // -----------------------------------
    // Sync currentTime (external seek)
    // -----------------------------------
    useEffect(() => {
      const el = videoRef.current;
      if (!el) return;

      if (Math.abs(el.currentTime - playerState.currentTime) > 0.1) {
        el.currentTime = playerState.currentTime;
      }
    }, [playerState.currentTime]);

    // -----------------------------------
    // Render
    // -----------------------------------
    return (
      <video
        style={{ width: '100%' }}
        ref={videoRef}
        src={`/api/video?path=${encodeURIComponent(video.url)}`}
        poster={video.image as string}
        className="mylift-video"
        playsInline
        preload="auto"
        onContextMenu={(e) => e.preventDefault()}
        onTimeUpdate={(e) => setPlayerState({
          ...playerState,
          currentTime: e.currentTarget.currentTime,
        })}
      />
    );
  }
);

export default VideoElement;
