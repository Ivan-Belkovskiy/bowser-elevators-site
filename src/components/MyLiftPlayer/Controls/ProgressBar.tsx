import "./ProgressBar.css";

import React, { useRef, useState, useEffect } from "react";
import PreviewThumbnail from "./PreviewThumbnail";
import { formatTime } from "@/utils/time";

interface ProgressBarProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  playerState: any;
  allowedMin: number;
  allowedMax: number;
  mode: "free" | "full";
}

export default function ProgressBar({
  videoRef,
  playerState,
  allowedMin,
  allowedMax,
  mode
}: ProgressBarProps) {

  const barRef = useRef<HTMLDivElement | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState<number | null>(null);

  const getTimeFromEvent = (e: MouseEvent | React.MouseEvent) => {
    const bar = barRef.current;
    const video = videoRef.current;
    if (!bar || !video) return null;

    const rect = bar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    let time = pos * video.duration;

    if (mode === "full") {
      if (time < allowedMin) time = allowedMin;
      if (time > allowedMax) time = allowedMax;
    }

    return time;
  };

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;

    const bar = barRef.current;
    const video = videoRef.current;
    if (!bar || !video) return;

    const rect = bar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = pos * video.duration;

    setHoverTime(time);
    setHoverX(e.clientX - rect.left);
  };

  const onLeave = () => {
    if (!isDragging) {
      setHoverTime(null);
      setHoverX(null);
    }
  };

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;

    const time = getTimeFromEvent(e);
    if (time === null) return;

    // videoRef.current!.currentTime = time;
  };

  const onThumbDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);

    const time = getTimeFromEvent(e);
    if (time !== null) setDragTime(time);
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent) => {
      const time = getTimeFromEvent(e);
      if (time !== null) {
        setDragTime(time);
        setHoverTime(time);
        const bar = barRef.current;
        if (bar) setHoverX(e.clientX - bar.getBoundingClientRect().left);
      }
    };

    const onUp = () => {
      if (dragTime !== null) {
        videoRef.current!.currentTime = dragTime;
      }
      setIsDragging(false);
      setHoverTime(null);
      setHoverX(null);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, dragTime, allowedMin, allowedMax, mode]);

  const progressPercent = isDragging
    ? (dragTime! / playerState.duration) * 100
    : (playerState.currentTime / playerState.duration) * 100;

  return (
    <div className="mylift-progress-container">
      <div
        className="mylift-progress"
        ref={barRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={onClick}
      >

        {mode === "full" && (
          <div
            className="mylift-progress-allowed"
            style={{
              left: `${(allowedMin / playerState.duration) * 100}%`,
              width: `${((allowedMax - allowedMin) / playerState.duration) * 100}%`
            }}
          />
        )}

        <div
          className="mylift-progress-bar"
          style={{
            width: `${progressPercent}%`
          }}
        />

        <div
          className="mylift-progress-thumb"
          style={{
            left: `${progressPercent}%`
          }}
          onMouseDown={onThumbDown}
        />
      </div>

      <span className="mylift-controls__time-display">{
        (formatTime(playerState.currentTime) || "0:00:00") +
        " / " +
        formatTime(playerState.duration)
      }</span>

      <PreviewThumbnail
        videoRef={videoRef}
        hoverTime={hoverTime}
        hoverX={hoverX}
        duration={playerState.duration}
      />
    </div>
  );
}
