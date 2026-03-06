'use client';

import { useState } from "react";
import FileUploader from "@/components/FileUploader/FileUploader";
import { LiftJson } from "@/types/elevator";
import "./LiftAppearanceModal.css";

export default function LiftAppearanceModal({
    elevator,
    onUpdate,
    onClose
}: {
    elevator: LiftJson,
    onUpdate: (updated: LiftJson) => void,
    onClose: () => void
}) {

    const [loading, setLoading] = useState(false);

    async function handleUpload(e: any, target: string) {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);

        const form = new FormData();
        form.append("file", file);
        form.append("target", target);

        const res = await fetch(`/api/elevators/${elevator.id}/assets`, {
            method: "PUT",
            body: form
        });

        const data = await res.json();
        setLoading(false);

        if (!data.success) return;

        const updated = structuredClone(elevator);

        // Разбираем путь target: "doors.left", "walls", "panel"
        const parts = target.split(".");
        let obj: any = updated.elevator.images;

        for (let i = 0; i < parts.length - 1; i++) {
            obj = obj[parts[i]];
        }

        const last = parts[parts.length - 1];
        obj[last] = { url: data.url };

        onUpdate(updated);
    }

    return (
        <div className="lift-appearance-modal__overlay">
            <div className="lift-appearance-modal">
                <div className="lift-appearance-modal__header">
                    <h1>Внешний вид лифта</h1>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="lift-appearance-modal__content">

                    {/* ДВЕРИ */}
                    <section className="appearance-section">
                        <h2>Двери лифта</h2>

                        <div className="appearance-row">
                            <div className="appearance-item">
                                <span className="appearance-label">Левая дверь</span>

                                {elevator.elevator.images.doors.left?.url && (
                                    <img
                                        src={elevator.elevator.images.doors.left.url}
                                        className="appearance-preview"
                                    />
                                )}

                                <FileUploader
                                    accept="image/*"
                                    label={{ upload: "Загрузить", replace: "Заменить" }}
                                    file={elevator.elevator.images.doors.left?.url || undefined}
                                    onUpload={(e) => handleUpload(e, "doors.left")}
                                />
                            </div>

                            <div className="appearance-item">
                                <span className="appearance-label">Правая дверь</span>

                                {elevator.elevator.images.doors.right?.url && (
                                    <img
                                        src={elevator.elevator.images.doors.right.url}
                                        className="appearance-preview"
                                    />
                                )}

                                <FileUploader
                                    accept="image/*"
                                    label={{ upload: "Загрузить", replace: "Заменить" }}
                                    file={elevator.elevator.images.doors.right?.url || undefined}
                                    onUpload={(e) => handleUpload(e, "doors.right")}
                                />
                            </div>
                        </div>
                    </section>

                    {/* СТЕНЫ */}
                    <section className="appearance-section">
                        <h2>Стены кабины</h2>

                        {elevator.elevator.images.walls?.url && (
                            <img
                                src={elevator.elevator.images.walls.url}
                                className="appearance-preview"
                            />
                        )}

                        <FileUploader
                            accept="image/*"
                            label={{ upload: "Загрузить", replace: "Заменить" }}
                            file={elevator.elevator.images.walls?.url || undefined}
                            onUpload={(e) => handleUpload(e, "walls")}
                        />
                    </section>

                    {/* КНОПОЧНАЯ ПАНЕЛЬ */}
                    <section className="appearance-section">
                        <h2>Кнопочная панель</h2>

                        {elevator.elevator.images.panel?.url && (
                            <img
                                src={elevator.elevator.images.panel.url}
                                className="appearance-preview"
                            />
                        )}

                        <FileUploader
                            accept="image/*"
                            label={{ upload: "Загрузить", replace: "Заменить" }}
                            file={elevator.elevator.images.panel?.url || undefined}
                            onUpload={(e) => handleUpload(e, "panel")}
                        />
                    </section>

                </div>

                <div className="lift-appearance-modal__footer">
                    <button className="close-btn" onClick={onClose}>Закрыть</button>
                </div>

                {loading && <div className="loading-overlay">Загрузка...</div>}
            </div>
        </div>
    );
}
