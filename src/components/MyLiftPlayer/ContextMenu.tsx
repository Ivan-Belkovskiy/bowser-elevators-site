import React, { useEffect, useRef } from "react";
import "./ContextMenu.css";

interface ContextMenuProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  playerState: any;
  mode: "free" | "full";
  allowedMin: number;
  allowedMax: number;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onOpenCoursebot?: () => void;
}

export default function ContextMenu({
  videoRef,
  playerState,
  mode,
  allowedMin,
  allowedMax,
  position,
  onClose,
  onOpenCoursebot
}: ContextMenuProps) {

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, [onClose]);

  if (!position) return null;

  const video = videoRef.current;
  const current = playerState.currentTime;

  const seek = (offset: number) => {
    if (!video) return;

    let newTime = current + offset;

    if (mode === "full") {
      if (newTime < allowedMin) newTime = allowedMin;
      if (newTime > allowedMax) newTime = allowedMax;
    }

    video.currentTime = newTime;
    onClose();
  };

  const canForward = mode === "free" || current + 10 <= allowedMax;
  const canBackward = mode === "free" || current - 10 >= allowedMin;

  const copyLink = () => {
    const url = `${window.location.href}?t=${Math.floor(current)}`;
    navigator.clipboard.writeText(url);
    onClose();
  };

  return (
    <div
      className="mylift-context-menu"
      ref={menuRef}
      style={{ top: position.y, left: position.x }}
    >
      <div
        className={"menu-item " + (!canBackward ? "disabled" : "")}
        onClick={() => canBackward && seek(-10)}
      >
        ⏪ Перемотать назад 10 сек
      </div>

      <div
        className={"menu-item " + (!canForward ? "disabled" : "")}
        onClick={() => canForward && seek(10)}
      >
        ⏩ Перемотать вперёд 10 сек
      </div>

      <div className="menu-item" onClick={copyLink}>
        🔗 Копировать ссылку на время
      </div>

      {onOpenCoursebot && (
        <div className="menu-item" onClick={onOpenCoursebot}>
          📚 Открыть в Coursebot Player
        </div>
      )}
    </div>
  );
}
