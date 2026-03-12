import React from "react";
import "./WarningModal.css";

interface WarningModalProps {
  visible: boolean;
  saving: boolean;
  onSave: () => void;
  onExitWithoutSave: () => void;
  onCancel: () => void;
}

export default function WarningModal({
  visible,
  saving,
  onSave,
  onExitWithoutSave,
  onCancel
}: WarningModalProps) {

  if (!visible) return null;

  return (
    <div className="warning-modal-overlay">
      <div className="warning-modal">
        <div className="warning-title">
          Сохранить прогресс просмотра?
        </div>

        <div className="warning-text">
          Если вы закроете двери сейчас, просмотр будет завершён.
          Хотите сохранить прогресс перед выходом?
        </div>

        <div className="warning-buttons">
          <button
            className="warning-btn save"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Сохранение..." : "Да, сохранить"}
          </button>

          <button
            className="warning-btn no"
            onClick={onExitWithoutSave}
            disabled={saving}
          >
            Нет
          </button>

          <button
            className="warning-btn cancel"
            onClick={onCancel}
            disabled={saving}
          >
            Отменить
          </button>
        </div>
      </div>
    </div>
  );
}
