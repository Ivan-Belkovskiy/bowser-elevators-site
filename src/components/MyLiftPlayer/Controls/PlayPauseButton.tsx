import "./PlayPauseButton.css";
import AudioController from "@/core/audio/AudioController";

export default function PlayPauseButton({ videoRef, playerState, setPlayerState, onClick }: any) {
  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;

    if (playerState.playing) {
      video.pause();
      setPlayerState((s: any) => ({ ...s, playing: false }));

      AudioController.unmuteElevatorMusic();

    } else {
      video.play();
      setPlayerState((s: any) => ({ ...s, playing: true }));

      AudioController.muteElevatorMusic();
    }
    onClick?.();
  };

  return (
    <button
      className={
        "mylift-play-button " +
        (playerState.playing ? "pause" : "play")
      }
      onClick={toggle}
    />
  );
}
