import React, { useEffect, useState } from "react";
import PlayPauseButton from "./PlayPauseButton";
import SeekButton from "./SeekButton";
import ProgressBar from "./ProgressBar";
import VolumeControl from "./VolumeControl";
import FullscreenButton from "./FullscreenButton";
import ContextMenu from "../ContextMenu";
import "./Controls.css";
import { formatTime } from "@/utils/time";

interface ControlsProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  playerState: any;
  setPlayerState: (fn: any) => void;
  mode: "free" | "full";
  allowedMin: number;
  allowedMax: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isFullscreen: boolean;
  onOpenCoursebot?: () => void;
  onButtonClick?: () => void;
  toggleFullscreen: () => void;
  // onFullscreenChange?: (isFullscreen: boolean) => void;
}

export default function Controls({
  videoRef,
  playerState,
  setPlayerState,
  mode,
  allowedMin,
  allowedMax,
  containerRef,
  isFullscreen,
  onOpenCoursebot,
  toggleFullscreen,
  onButtonClick
  // onFullscreenChange
}: ControlsProps) {

  // const [isFullscreen, setIsFullscreen] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  const openContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    setContextMenuPos(null);
  };

  // useEffect(() => {
  //   alert(playerState.duration);
  // }, [playerState]);

  // const switchFullscreen = (value: boolean) => {
  //   setIsFullscreen(value);
  //   onFullscreenChange?.(value);
  // }

  // const toggleFullscreen = async () => {
  //   const container = containerRef.current;
  //   if (!container) return;

  //   if (!document.fullscreenElement) {
  //     await container.requestFullscreen();
  //     setIsFullscreen(true);
  //   } else {
  //     await document.exitFullscreen();
  //     setIsFullscreen(false);
  //   }
  // };

  return (
    <div className="mylift-controls">
      <div className="mylift-controls__left">
        <SeekButton
          videoRef={videoRef}
          mode={mode}
          direction="left"
          maxWatchedTime={playerState.maxWatchedTime}
          rewindWindow={20}
          onClick={onButtonClick}
        />
        <PlayPauseButton
          videoRef={videoRef}
          playerState={playerState}
          setPlayerState={setPlayerState}
          onClick={onButtonClick}
        />
        <SeekButton
          videoRef={videoRef}
          mode={mode}
          direction="right"
          maxWatchedTime={playerState.maxWatchedTime}
          rewindWindow={20}
          onClick={onButtonClick}
        />

        <ProgressBar
          videoRef={videoRef}
          playerState={playerState}
          allowedMin={allowedMin}
          allowedMax={allowedMax}
          mode={mode}
        />
      </div>
      <div className="mylift-controls__right">
        {isFullscreen && (
          <>
            <button className="mylift-controls__coursebot-button" onClick={async () => {
              onButtonClick?.();
              if (isFullscreen) await toggleFullscreen();
              onOpenCoursebot?.();
            }}></button>
            <img src="/images/player/mylift-player/ui/player-logo.png" className="mylift-player-logo" />
          </>
        )}
        <VolumeControl videoRef={videoRef} />
        <FullscreenButton containerRef={containerRef} isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />
      </div>
    </div>
  );

  // return (
  //   <div
  //     className="mylift-controls"
  //     onContextMenu={openContextMenu}
  //   >

  //     <div className="controls-top">
  //       <VolumeControl videoRef={videoRef} />

  //       <div
  //         className="context-button"
  //         onClick={(e) => {
  //           e.stopPropagation();
  //           setContextMenuPos({ x: e.clientX, y: e.clientY });
  //         }}
  //       >
  //         ⋮
  //       </div>
  //     </div>

  //     <div className="controls-center">
  //       <PlayPauseButton
  // videoRef={videoRef}
  // playerState={playerState}
  // setPlayerState={setPlayerState}
  //       />

  //       <SeekButtons
  //         videoRef={videoRef}
  //         mode={mode}
  //         maxWatchedTime={playerState.maxWatchedTime}
  //         rewindWindow={20} 
  //       />

  //       <FullscreenButton containerRef={containerRef} />
  //     </div>

  //     <div className="controls-bottom">
  // <ProgressBar
  //   videoRef={videoRef}
  //   playerState={playerState}
  //   allowedMin={allowedMin}
  //   allowedMax={allowedMax}
  //   mode={mode}
  // />
  //     </div>

  //     <ContextMenu
  //       videoRef={videoRef}
  //       playerState={playerState}
  //       mode={mode}
  //       allowedMin={allowedMin}
  //       allowedMax={allowedMax}
  //       position={contextMenuPos}
  //       onClose={closeContextMenu}
  //       onOpenCoursebot={onOpenCoursebot}
  //     />
  //   </div>
  // );
}
