import { RefObject } from "react";
import "./SeekButton.css";

export default function SeekButton({
  videoRef,
  mode,
  maxWatchedTime,
  rewindWindow = 600,
  direction = "left",
  onClick,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  mode: string;
  maxWatchedTime: number;
  rewindWindow: number;
  direction: "left" | "right";
  onClick?: () => void;
}) {

  const handleClick = (offset: number) => {
    const video = videoRef.current;
    if (!video) return;

    const current = video.currentTime;
    let newTime = current + offset;

    if (mode === "full") {
      const allowedMin = Math.max(0, maxWatchedTime - rewindWindow);
      const allowedMax = maxWatchedTime;

      if (newTime < allowedMin) newTime = allowedMin;
      if (newTime > allowedMax) newTime = allowedMax;
    }

    video.currentTime = newTime;
    onClick?.();
  };

  return direction === "left" ? (
    <button className="mylift-seek-button left" onClick={() => handleClick(-10)} />
  ) : (
    <button
      className={
        "mylift-seek-button right " +
        (mode === "full" ? "disabled" : "")
      }
      onClick={() => {
        if (mode === "free") handleClick(10);
        if (mode === "full") handleClick(10);
      }}
    />
  );
}
