import React, { RefObject, useState } from "react";
import "./FullscreenButton.css";

export default function FullscreenButton({ containerRef, isFullscreen, toggleFullscreen }: {
  containerRef: RefObject<HTMLElement | null>;
  isFullscreen?: boolean;
  toggleFullscreen?: () => void;
}) {
  // const [isFullscreen, setIsFullscreen] = useState(false);

  // const toggleFullscreen = async () => {
  //   const container = containerRef.current;
  //   if (!container) return;

  //   if (!document.fullscreenElement) {
  //     await container.requestFullscreen();
  //     setIsFullscreen(true);
  //     onEnterFullscreen?.();
  //   } else {
  //     await document.exitFullscreen();
  //     setIsFullscreen(false);
  //     onExitFullscreen?.();
  //   }
  // };

  return (
    <div
      className={
        "mylift-fullscreen-button " +
        (isFullscreen ? "exit" : "enter")
      }
      onClick={toggleFullscreen}
    />
  );
}
