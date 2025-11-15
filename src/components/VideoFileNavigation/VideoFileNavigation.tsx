'use client';

import { useState, useEffect } from "react";
import ModalWrapper from "../ModalWrapper/ModalWrapper";
import "./VideoFileNavigation.css";
import { VideoFileNavigationProps } from "@/types/components/VideoFileNavigation/VideoFileNavigation";

export default function VideoFileNavigation({ defaultPath, onClose, onSelect }: VideoFileNavigationProps) {
    const getParentDir = (dir: string): string => {
        const normalized = dir.replace(/\\/g, '/');
        const segments = normalized.split('/');
        if (segments.length <= 1) return normalized.endsWith('/') ? normalized : normalized + '/';

        segments.pop(); // удалить последний сегмент
        const parent = segments.join('/');
        return parent.endsWith(':') ? parent + '/' : parent;
    }

    const [currentDir, setCurrentDir] = useState<string>(defaultPath?.endsWith('.mp4') ? getParentDir(defaultPath) : defaultPath || 'D:/Media/Video');
    const [items, setItems] = useState<{ name: string; type: string; path: string }[]>([]);

    useEffect(() => {
        fetch(`/api/files?dir=${encodeURIComponent(currentDir)}`)
            .then(res => res.json())
            .then((result: { name: string; type: string; path: string }[]) => setItems(
                result.sort((a: { name: string; type: string; path: string }, b: { name: string; type: string; path: string }) => {
                    if (a.type === b.type) return a.name.localeCompare(b.name);
                    return a.type === 'folder' ? -1 : 1;
                }).filter(item => item.type === 'file' ? item.name.split('.').pop() === 'mp4' && item : item)
            ));
    }, [currentDir]);

    return (
        <ModalWrapper>
            <div className="video-file-navigation">
                <div className="video-file-navigation__container">
                    <div className="video-file-navigation__main">
                        <div className="video-file-navigation__top-panel">
                            <div className="video-file-navigation__current-dir">{currentDir}</div>
                            <button className="video-file-navigation__button back-dir-btn" onClick={() => {
                                if (currentDir !== 'D:/') {
                                    // const parentDir = currentDir.replace(/[/\\][^/\\]+$/, '');
                                    const parentDir = getParentDir(currentDir);
                                    setCurrentDir(parentDir);
                                }
                            }}>▲</button>
                        </div>
                        <ul className="video-file-navigation__file-list">
                            {items.length > 0 ? items.map(item =>
                                item.type === 'folder' ? (
                                    <button
                                        key={item.path}
                                        className="video-file-navigation__button item-button folder-button"
                                        onClick={() => setCurrentDir(item.path)}
                                    >{item.name}</button>
                                ) : (
                                    <button
                                        className="video-file-navigation__button item-button file-button"
                                        key={item.path}
                                        onClick={() => {
                                            onSelect?.(item.path);
                                            onClose?.();
                                        }}
                                    >{item.name}</button>
                                )
                            ) : <div className="video-file-navigation__message-box">В этой папке нет видео.</div>}
                        </ul>
                    </div>
                    <div className="video-file-navigation__buttons">
                        <button className="video-file-navigation__button close-button" onClick={() => onClose?.()}>Закрыть</button>
                    </div>

                </div>

            </div>
        </ModalWrapper>
    );
}