import React from "react";
import "./WarningModal.css";

// Добавляем типы для режимов окна
export type WarningModalViewMode = "full" | "free";

interface WarningModalProps {
  visible: boolean;
  saving: boolean;
  mode: WarningModalViewMode; // Новый проп
  onSave: () => void;
  onExitWithoutSave: () => void;
  onCancel: () => void;
  onSwitchMode?: () => void; // Опционально: для перехода в full из free
}

export default function WarningModal({
  visible,
  saving,
  mode,
  onSave,
  onExitWithoutSave,
  onCancel,
  onSwitchMode
}: WarningModalProps) {

  if (!visible) return null;

  // Конфигурация контента в зависимости от режима плеера
  const isFull = mode === "full";

  return (
    <div className="warning-modal-overlay">
      <div className="warning-modal">
        <div className="warning-title">
          {isFull ? "Выйти из MyLift Player?" : "Завершить просмотр?"}
        </div>

        <div className="warning-text">
          {isFull 
            ? "Несохраненный прогресс будет потерян! В полноценном режиме важно сохранять точку остановки." 
            : "Вы можете выйти или изменить параметры просмотра."}
        </div>

        <div className="warning-buttons">
          {/* Кнопка сохранения нужна в обоих режимах, но в Full она приоритетна */}
          <button
            className="warning-btn save"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Сохранение..." : isFull ? "Сохранить и выйти" : "Сохранить фрагмент"}
          </button>

          {/* Кнопка прямого выхода */}
          <button
            className="warning-btn no"
            onClick={onExitWithoutSave}
            disabled={saving}
          >
            {isFull ? "Выйти без сохранения" : "Выйти"}
          </button>

          {/* Специфичная кнопка для Free режима: переключение на Full */}
          {!isFull && onSwitchMode && (
            <button
              className="warning-btn switch"
              onClick={onSwitchMode}
              disabled={saving}
            >
              Выбрать вариант просмотра
            </button>
          )}

          {/* Кнопка отмены — всегда возвращает в плеер */}
          <button
            className="warning-btn cancel"
            onClick={onCancel}
            disabled={saving}
          >
            Вернуться в MyLift Player
          </button>
        </div>
      </div>
    </div>
  );
}