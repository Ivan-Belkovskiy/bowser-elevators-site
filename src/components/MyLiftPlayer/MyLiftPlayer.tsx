'use client';

import React, { useState, useRef, useEffect, CSSProperties, Dispatch, SetStateAction, RefObject } from 'react';
import { VideoData } from '@/types/data/VideoData';
import { LevelBotMode, SavePayload } from '@/components/LevelBot/LevelBotModal';
import "./MyLiftPlayer.css";

import VideoElement from './VideoElement';
import Controls from './Controls/Controls';
import WarningModal from './WarningModal';

import AutoSaveManager from './AutoSaveManager';
import StatsManager from './StatsManager';
import { AutosaveSlotData, LiftJson, SlotData, VideoStats } from '@/types/elevator';
import PlayModeModal from './PlayModeModal';
import AudioController from '@/core/audio/AudioController';

export type MyLiftPlayerMode = "full" | "free";

export interface MyLiftPlayerProps {
  video: VideoData;
  liftId: string;
  floorId: string;
  mode: MyLiftPlayerMode;
  initialTime?: number;
  styles?: CSSProperties;
  slotDataToOpen?: {
    main: SlotData;
    mode?: MyLiftPlayerMode;
  } | null;
  autoSaveData?: AutosaveSlotData | null;
  coursebotOptions?: LiftJson['coursebot'];
  playerStateRef?: RefObject<PlayerState | null>; // Для передачи данных в ElevatorVideoPlayer
  activateRef?: RefObject<((mode: MyLiftPlayerMode) => void) | null>;
  resetRef?: RefObject<(() => void) | null>;
  requestAutosaveRef?: RefObject<(() => void) | null>;
  onlyFullModeAutosave?: boolean;
  videoStats?: VideoStats;

  updateOpeningSlotData?: Dispatch<SetStateAction<{
    main: SlotData,
    mode?: MyLiftPlayerMode,
  } | null>>;
  onRequestSave: (payload: SavePayload) => void;
  onRequestAutosave: (payload: SavePayload, playerState: PlayerState) => void;
  onRequestLoad: () => void;
  onInitialPlay?: () => void;
  onVideoEnded?: (playerState: PlayerState, videoId: string) => void;
}

export interface MyLiftPlayerWatchData {
  watchNumber?: number;
  startDate?: string;
  endDate?: string;
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
  mode: MyLiftPlayerMode;
  watchInfo?: MyLiftPlayerWatchData,
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
  activateRef,
  resetRef,
  requestAutosaveRef,
  onlyFullModeAutosave,
  videoStats,
  updateOpeningSlotData,
  onRequestLoad,
  onRequestSave,
  onRequestAutosave,
  onInitialPlay,
  onVideoEnded,
}: MyLiftPlayerProps) {

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // if (!video) return null;

  useEffect(() => {
    if (activateRef) activateRef.current = activatePlayer;
  });

  useEffect(() => {
    if (resetRef) resetRef.current = resetPlayer;
  });

  useEffect(() => {
    if (requestAutosaveRef) requestAutosaveRef.current = requestAutoSave;
  });

  const handleInitialPlay = () => {
    AudioController.setVolume({
      music: {
        ...AudioController.volume.music,
        on: false,
      }
    });
    onInitialPlay?.();
  };

  const activatePlayer = (selectedMode: MyLiftPlayerMode) => {
    // const watchCount = video.id
    // alert(videoStats?.views);
    const watchInfo = (selectedMode === 'full') ? {
      startDate: new Date().toLocaleString().replace(',', ''),
      watchNumber: ((videoStats?.views || 0) + 1),
    } : {};
    setPlayerState(prev => ({
      ...prev,
      mode: selectedMode,
      activated: true,
      playing: true,
      watchInfo: {
        ...prev.watchInfo,
        ...watchInfo
      }
    }));
  };

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
    mode,
    watchInfo: (mode === 'full') ? {
      startDate: new Date().toLocaleString().replace(',', ''),
    } : undefined
  });

  const rewindWindow = 900;
  const allowedMin =
    playerState.mode === 'full'
      ? Math.max(0, playerState.maxWatchedTime - rewindWindow)
      : 0;

  const allowedMax =
    playerState.mode === 'full'
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

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const requestAutoSave = () => {
    const preview = captureFrame();
    if (preview) {
      onRequestAutosave({
        createdAt: new Date().toLocaleString(),
        floorId,
        videoId: video.id,
        thumbnailUrl: preview,
        timecode: videoRef.current?.currentTime || 0
      }, playerState);
    }
  }

  useEffect(() => {
    const autosaveInterval = coursebotOptions?.autosaveDelaySec || 10;

    const shouldStartTimeout = (!playerState.playing && playerState.activated && !playerState.ended) &&
      (playerState.mode === 'free' ? !onlyFullModeAutosave : true);

    // if (playerState.activated) { // Раскомментировать, если нужно отключить музыку на все время просмотра
    //   AudioController.setVolume({
    //     music: {
    //       ...AudioController.volume.music,
    //       on: false,
    //     }
    //   });
    // }
    // alert(autosaveInterval);
    if (shouldStartTimeout) {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

      autosaveTimerRef.current = setTimeout(async () => {
        if (playerState.playing) return;

        if (document.fullscreenElement) {
          try {
            await document.exitFullscreen();
            setIsFullscreen(false);
            setPlayerState(prev => ({ ...prev, fullscreen: false }));
          } catch (err) {
            console.warn("Не удалось выйти из Fullscreen (вкладка не активна):", err);
          }
        }

        requestAutoSave();
        // const preview = captureFrame();
        // if (preview) {
        //   onRequestAutosave({
        //     createdAt: new Date().toLocaleString(),
        //     floorId,
        //     videoId: video.id,
        //     thumbnailUrl: preview,
        //     timecode: videoRef.current?.currentTime || 0
        //   });
        // }
      }, autosaveInterval * 1000);
    }

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [playerState.playing, playerState.activated, playerState.ended]);

  useEffect(() => {
    AutoSaveManager.reset();
  }, [video.id]);

  useEffect(() => {
    const handleFsChange = () => {
      const isActuallyFull = !!document.fullscreenElement;
      setIsFullscreen(isActuallyFull);
      setPlayerState(prev => ({ ...prev, fullscreen: isActuallyFull }));
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // useEffect(() => {
  //   StatsManager.checkAndReport(
  //     playerState,
  //     video.id,
  //     liftId,
  //     async (payload) => onRequestSave(payload)
  //   );
  // }, [playerState.maxWatchedTime]);

  useEffect(() => {
    StatsManager.reset();
  }, [video.id]);

  const loadCoursebotSlotData = (data?: SlotData | null, playerMode?: MyLiftPlayerMode) => {
    const commonData = (data?.isAutosave) ? data?.data.main : data?.data;
    if (commonData?.timecode !== undefined && videoRef.current) {
      videoRef.current.currentTime = commonData.timecode;

      if (data?.isAutosave && data?.data?.playerState) {
        // alert(playerMode);
        setPlayerState(prev => ({
          ...data.data.playerState,
          fullscreen: prev.fullscreen,
          // mode: 'free'
          mode: playerMode ? playerMode : data.data.playerState.mode,
        }));
      } else {
        setPlayerState(prev => ({
          ...prev,
          mode: "free",
          activated: true,
          // playing: true 
        }));
      }

      updateOpeningSlotData?.(null);
    }
  }

  useEffect(() => {
    if (slotDataToOpen) loadCoursebotSlotData(slotDataToOpen?.main, slotDataToOpen?.mode);
  }, [slotDataToOpen])

  useEffect(() => {
    if (playerState.ended) {
      onVideoEnded?.({
        ...playerState,
        watchInfo: {
          ...playerState.watchInfo,
          endDate: new Date().toLocaleString().replace(',', ''),
        }
      }, video.id);
    }
  }, [playerState.ended]);

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

  const onOpenCoursebot = (mode: LevelBotMode = 'default') => {
    if (mode === 'load') {
      onRequestLoad();
    } else {
      const time = videoRef.current?.currentTime ?? 0;
      const preview = captureFrame();

      if (mode === 'save') {
        onRequestSave({
          createdAt: new Date().toLocaleString().replace(',', ''),
          floorId,
          videoId: video.id,
          timecode: time,
          thumbnailUrl: preview ?? ""
        });
      } else if (mode === 'autosave') {
        onRequestAutosave({
          createdAt: new Date().toLocaleString(),
          floorId,
          videoId: video.id,
          thumbnailUrl: preview ?? "",
          timecode: videoRef.current?.currentTime || 0
        }, playerState);
      }
    }
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      await container.requestFullscreen();
      setIsFullscreen(true);
      setPlayerState(prev => ({ ...prev, fullscreen: true }));
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
      setPlayerState(prev => ({ ...prev, fullscreen: false }));
    }
  };


  const resetPlayer = () => {
    setPlayerState({
      activated: false,
      playing: false,
      currentTime: 0,
      duration: 0,
      maxWatchedTime: 0,
      volume: 1,
      fullscreen: false,
      loading: false,
      ended: false,
      mode: 'free'
    });

    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.currentTime = 0;
      // if (typeof video.image === 'string') videoRef.current.poster = video.image;
    }

    // setShowWarning(false);
  };



  useEffect(() => {
    if (playerStateRef) playerStateRef.current = playerState;
    // alert(playerState.mode);
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
          mode={playerState.mode}
          allowedMin={allowedMin}
          allowedMax={allowedMax}
          containerRef={containerRef}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          // onFullscreenChange={(val) => setIsFullscreen(val)}
          onOpenCoursebot={onOpenCoursebot}
          onButtonClick={() => {
            if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
          }}
        />
      ) : (
        <>
          <button className="mylift-player__play-btn" onClick={handleInitialPlay}></button>
        </>
      )}

      {/* <WarningModal
        visible={showWarning}
        saving={saving}
        mode={playerState.mode}
        onSave={saveAndExit}
        onExitWithoutSave={exitWithoutSave}
        onCancel={cancelWarning}
        onSwitchMode={() => setShowModeSelection(true)}
      /> */}

    </div>
  );
}
