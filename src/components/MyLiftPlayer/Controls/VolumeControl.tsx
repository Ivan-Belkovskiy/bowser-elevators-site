import React, { useState } from "react";
import "./VolumeControl.css";

export default function VolumeControl({ videoRef }: any) {
  const [showSlider, setShowSlider] = useState(false);
  const [volume, setVolume] = useState(1);
  const [volumeOff, setVolumeOff] = useState(false);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    if (!video.muted) {
      video.volume = volume;
    }
    setVolumeOff(video.muted);
  };

  const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const v = Number(e.target.value);
    setVolume(v);
    video.volume = v;
    video.muted = v === 0;
  };

  const video = videoRef.current;
  const isMuted = (video?.muted || volumeOff) || volume === 0;

  return (
    <div
      className="mylift-volume-control"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <div
        className={
          "mylift-volume-button " + (isMuted ? "muted" : "unmuted")
        }
        onClick={toggleMute}
      />

      {showSlider && (
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={onVolumeChange}
          className="mylift-volume-slider"
        />
      )}
    </div>
  );
}
