'use client';

import React, { useState, useRef, useEffect, CSSProperties, Dispatch, SetStateAction, RefObject } from 'react';
import { VideoData } from '@/types/data/VideoData';
import { SavePayload } from '@/components/LevelBot/LevelBotModal';
import "./MyLiftPlayer.css";

import VideoElement from './VideoElement';
import Controls from './Controls/Controls';
import WarningModal from './WarningModal';

import AutoSaveManager from './AutoSaveManager';
import StatsManager from './StatsManager';
import { AutosaveSlotData, LiftJson, SlotData } from '@/types/elevator';

export interface MyLiftPlayerProps {
  video: VideoData;
  liftId: string;
  floorId: string;
  mode: 'free' | 'full';
  initialTime?: number;
  styles?: CSSProperties;
  slotDataToOpen?: SlotData | null;
  autoSaveData?: AutosaveSlotData | null;
  coursebotOptions?: LiftJson['coursebot'];
  playerStateRef?: RefObject<PlayerState | null> // Для передачи данных в ElevatorVideoPlayer
  updateOpeningSlotData?: Dispatch<SetStateAction<SlotData | null>>;
  onRequestSave: (payload: SavePayload) => void;
  onRequestAutosave: (payload: SavePayload) => void;
}

export interface PlayerState {
  activated: boolean,
  playing: boolean,
  currentTime: number,
  duration: number,
  maxWatchedTime: number,
  volume: number,
  fullscreen: boolean,
  loading: boolean,
  ended: boolean,
  mode: "full" | "free";
}

export default function MyLiftPlayer({
  video,
  liftId,
  floorId,
  mode,
  styles,
  initialTime = 0,
  slotDataToOpen,
  autoSaveData,
  coursebotOptions,
  playerStateRef,
  updateOpeningSlotData,
  onRequestSave,
  onRequestAutosave
}: MyLiftPlayerProps) {

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [playerState, setPlayerState] = useState<PlayerState>({
    activated: false,
    playing: false,
    currentTime: initialTime,
    duration: 0,
    maxWatchedTime: initialTime,
    volume: 1,
    fullscreen: false,
    loading: true,
    ended: false,
    mode
  });

  const rewindWindow = 20;
  const allowedMin =
    mode === 'full'
      ? Math.max(0, playerState.maxWatchedTime - rewindWindow)
      : 0;

  const allowedMax =
    mode === 'full'
      ? playerState.maxWatchedTime
      : playerState.duration;

  useEffect(() => {
    if (playerState.currentTime > playerState.maxWatchedTime) {
      setPlayerState(s => ({
        ...s,
        maxWatchedTime: playerState.currentTime
      }));
    }
  }, [playerState.currentTime]);

  // useEffect(() => {
  //   if (playerState.playing) {
  //     AutoSaveManager.startAutoSave(
  //       playerState,
  //       async (payload) => onRequestAutosave(payload),
  //       10 // Интервал автосохранения
  //     );
  //   } else {
  //     AutoSaveManager.stopAutoSave();
  //   }
  // }, [playerState.playing]);


  useEffect(() => {
    const autosaveInterval = coursebotOptions?.autosaveDelaySec || 10;
    let autosaveTimeoutId = null;
    // alert(playerState.currentTime)
    // alert(`playing: ${playerState.playing}\nisAutosaved: ${isAutosaved}\nactivated: ${playerState.activated}`);
    if ((!playerState.playing && (((Number(videoRef.current?.currentTime)) > Number(autoSaveData?.playerState.currentTime)) || !autoSaveData)) && playerState.activated) {
      if (autosaveTimeoutId) clearTimeout(autosaveTimeoutId);
      autosaveTimeoutId = setTimeout(async () => {
        if (playerState.playing) return;
        await document.exitFullscreen();
        setIsFullscreen(false);
        setPlayerState({
          ...playerState,
          fullscreen: false,
        });
        const preview = captureFrame();
        onRequestAutosave({
          createdAt: new Date().toLocaleString(),
          floorId,
          videoId: video.id,
          thumbnailUrl: preview ?? "",
          timecode: videoRef.current?.currentTime || 0
        });

      }, (autosaveInterval * 1000));
    } else {
      if (autosaveTimeoutId) clearTimeout(autosaveTimeoutId);
      // AutoSaveManager.stopAutoSave();
    }
  }, [playerState.playing]);

  useEffect(() => {
    AutoSaveManager.reset();
  }, [video.id]);

  useEffect(() => {
    StatsManager.checkAndReport(
      playerState,
      video.id,
      liftId,
      async (payload) => onRequestSave(payload)
    );
  }, [playerState.maxWatchedTime]);

  useEffect(() => {
    StatsManager.reset();
  }, [video.id]);

  const loadCoursebotSlotData = (data?: SlotData | null) => {
    if (data?.timecode && videoRef.current) {
      videoRef.current.currentTime = data.timecode;
      updateOpeningSlotData?.(null);
    }
  }

  useEffect(() => {
    loadCoursebotSlotData(slotDataToOpen);
  }, [slotDataToOpen])

  const [showWarning, setShowWarning] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleDoorCloseAttempt = () => {
    if (playerState.playing || playerState.currentTime > 0) {
      setShowWarning(true);
    } else {
      closeDoorsNormally();
    }
  };

  const saveAndExit = async () => {
    setSaving(true);

    await AutoSaveManager.saveProgress(
      playerState,
      async (payload) => onRequestAutosave(payload)
    );

    setSaving(false);
    setShowWarning(false);

    closePlayer();
    closeDoorsNormally();
  };

  const exitWithoutSave = () => {
    setShowWarning(false);
    closePlayer();
    closeDoorsNormally();
  };

  const cancelWarning = () => {
    setShowWarning(false);
  };

  // -----------------------------
  // Close player (UI-level)
  // -----------------------------
  const closePlayer = () => {
    setPlayerState(s => ({
      ...s,
      playing: false
    }));
  };

  const captureFrame = (): string | null => {
    const video = videoRef.current;
    if (!video) return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/png");
  };

  const onOpenCoursebot = () => {
    const time = videoRef.current?.currentTime ?? 0;
    const thumbnail = captureFrame();

    onRequestSave({
      createdAt: new Date().toLocaleString().replace(',', ''),
      floorId,
      videoId: video.id,
      timecode: time,
      thumbnailUrl: thumbnail ?? ""
    });
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      await container.requestFullscreen();
      setIsFullscreen(true);
      setPlayerState({
        ...playerState,
        fullscreen: true,
      });
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
      setPlayerState({
        ...playerState,
        fullscreen: false,
      });
    }

  };


  // -----------------------------
  // Close elevator doors (stub)
  // -----------------------------
  const closeDoorsNormally = () => {
    // Здесь будет логика закрытия дверей в ElevatorVideoPlayer
    console.log("Doors closing...");
  };


  useEffect(() => {
    if (playerStateRef) playerStateRef.current = playerState;
  }, [playerState]);

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="mylift-player" ref={containerRef} style={{
      ...styles,
      width: isFullscreen ? '100vw' : styles?.width || "600px",
      height: isFullscreen ? '100vh' : styles?.height,
    }}>

      <VideoElement
        ref={videoRef}
        video={video}
        playerState={playerState}
        setPlayerState={setPlayerState}
      />

      {playerState.activated ? (
        <Controls
          videoRef={videoRef}
          playerState={playerState}
          setPlayerState={setPlayerState}
          mode={mode}
          allowedMin={allowedMin}
          allowedMax={allowedMax}
          containerRef={containerRef}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          // onFullscreenChange={(val) => setIsFullscreen(val)}
          onOpenCoursebot={onOpenCoursebot}
        />
      ) : (
        <button className="mylift-player__play-btn" onClick={() => setPlayerState({
          ...playerState,
          activated: true,
          playing: true,
        })}></button>
      )}

      <WarningModal
        visible={showWarning}
        saving={saving}
        onSave={saveAndExit}
        onExitWithoutSave={exitWithoutSave}
        onCancel={cancelWarning}
      />

    </div>
  );
}
