import { RefObject } from "react";
import "./SeekButton.css";

export default function SeekButton({
  videoRef,
  mode,
  maxWatchedTime,
  rewindWindow = 60,
  direction = "left",
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  mode: string;
  maxWatchedTime: number;
  rewindWindow: number;
  direction: "left" | "right";
}) {

  const seek = (offset: number) => {
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
  };

  return direction === "left" ? (
    <button className="mylift-seek-button left" onClick={() => seek(-10)} />
  ) : (
    <button
      className={
        "mylift-seek-button right " +
        (mode === "full" ? "disabled" : "")
      }
      onClick={() => {
        if (mode === "free") seek(10);
        if (mode === "full") seek(10);
      }}
    />
  );
}
