import React, { useEffect, useRef } from "react";
import "./PreviewThumbnail.css";

interface PreviewThumbnailProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  hoverTime: number | null;
  hoverX: number | null;
  duration: number;
}

export default function PreviewThumbnail({
  videoRef,
  hoverTime,
  hoverX,
  duration
}: PreviewThumbnailProps) {

  const previewRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const mainVideo = videoRef.current;
    const preview = previewRef.current;

    if (!preview || !mainVideo || hoverTime === null) return;

    if (preview.src !== mainVideo.src) {
      preview.src = mainVideo.src;
    }

    preview.currentTime = Math.min(Math.max(0, hoverTime), duration);
  }, [hoverTime, duration, videoRef]);

  if (hoverTime === null || hoverX === null) {
    return null;
  }

  return (
    <div
      className="mylift-preview-thumbnail"
      style={{
        left: hoverX
      }}
    >
      <video
        ref={previewRef}
        className="mylift-preview-video"
        muted
        playsInline
      />
      <div className="mylift-preview-time">
        {formatTime(hoverTime)}
      </div>
    </div>
  );
}

// Форматирование времени
function formatTime(input: number) {
  if (!input) return null;
  const hours = Math.floor(input / 3600);
  const minutes = Math.floor((input / 60) % 60);
  const seconds = Math.floor(input % 60);
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  // const m = Math.floor(sec / 60);
  // const s = Math.floor(sec % 60);
  // return `${m}:${s.toString().padStart(2, "0")}`;
}
