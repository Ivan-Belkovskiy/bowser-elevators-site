import { ElevatorDirections, ElevatorDisplayConfig, ElevatorDisplayTypes } from "@/types/elevator";
import "./ElevatorDisplay.css";
import { generateDisplaySVG } from "@/utils/elevator/displayGenerator";
import { CSSProperties, useEffect, useRef, useState } from "react";

export default function ElevatorDisplay({
    inElevator,
    type,
    floor,
    direction,
    data,
    styles,
    onClick,
    editMode,
    isEditing,
    options
}: {
    inElevator?: boolean,
    type: ElevatorDisplayTypes,
    floor: number,
    direction: ElevatorDirections,
    data?: ElevatorDisplayConfig,
    styles?: CSSProperties,
    onClick?: () => any,
    editMode?: boolean,
    isEditing?: boolean,
    options?: ElevatorDisplayConfig['options']
}) {

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playingTrack, setPlayingTrack] = useState<number | null>(null);

    useEffect(() => {
        if (playingTrack === null) return;

        const trackNumber = ((playingTrack - 1) % 5) + 1;

        const audio = new Audio(
            `/audio/music/elevator/MogilevLiftMach/elevator-music-${String(trackNumber).padStart(2, "0")}.mp3`
        );
        audioRef.current = audio;

        const handleEnded = () => {
            setPlayingTrack(prev => (prev ?? 0) + 1);
        };

        audio.addEventListener("ended", handleEnded);

        audio.addEventListener("canplay", () => {
            audio.currentTime = 0;
            audio.play().catch(() => { });
        }, { once: true });

        return () => {
            audio.removeEventListener("ended", handleEnded);
            audio.pause();
        };
    }, [playingTrack]);

    const playBackgroundMusic = () => {
        setPlayingTrack(1);
    };

    const stopBackgroundMusic = () => {
        setPlayingTrack(null);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    };

    useEffect(() => {
        if (options?.backgroundMusic === true && !editMode) {
            playBackgroundMusic();
        } else {
            stopBackgroundMusic();
        }
    }, [editMode, options]);

    return (
        <div
            className={`elevator-display ${(inElevator === true) ? 'in-elevator' : ''} ${(editMode) ? 'edit-mode' : ''} ${(isEditing) ? 'editing' : ''}`}
            style={styles}
            dangerouslySetInnerHTML={{
                __html: generateDisplaySVG(type, {
                    floor,
                    direction,
                    indicationColor: String(data?.options?.indicationColor || "red")
                })
            }}
            onClick={onClick}
        ></div>
    );
}
