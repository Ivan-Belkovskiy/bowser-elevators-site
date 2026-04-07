import { ElevatorDisplayTypes } from "@/types/elevator";

class AudioController {
    private static instance: AudioController;

    // -----------------------------
    // Background music (5-track cycle)
    // -----------------------------
    private elevatorMusic: HTMLAudioElement | null = null;
    private elevatorMusicEnabled = false;
    private elevatorMusicMuted = false;
    private currentTrack = 1;

    // -----------------------------
    // Movement sounds
    // -----------------------------
    public movementStart: HTMLAudioElement | null = null;
    public movementLoop: HTMLAudioElement | null = null;
    public movementEnd: HTMLAudioElement | null = null;

    // -----------------------------
    // Door sounds
    // -----------------------------
    private doorOpen: HTMLAudioElement | null = null;
    private doorClose: HTMLAudioElement | null = null;

    // -----------------------------
    // Voice announcements
    // -----------------------------
    private floorAnnouncement: HTMLAudioElement | null = null;
    private directionAnnouncement: HTMLAudioElement | null = null;
    private endMoveBeep: HTMLAudioElement | null = null;

    // -----------------------------
    // Elevator UI sounds (button click)
    // -----------------------------
    private elevatorButtonClick: HTMLAudioElement | null = null;

    // -----------------------------
    //  Coursebot UI sounds
    // -----------------------------
    private coursebotSounds: Record<string, HTMLAudioElement> = {};

    private coursebotMusic: HTMLAudioElement | null = null;

    // -----------------------------
    // Global mute
    // -----------------------------
    private globalMuted = false;
    public volume = {
        elevator: {
            volume: 0.10,
            on: true,
        },
        music: {
            volume: 0.03,
            on: true,
        },
        coursebot: {
            ui: {
                volume: 0.22,
                on: true,
            },
            music: {
                volume: 0.06,
                on: true,
            },
        },
    };

    static getInstance() {
        if (!AudioController.instance) {
            AudioController.instance = new AudioController();
        }
        return AudioController.instance;
    }

    // ============================================================
    // BACKGROUND MUSIC
    // ============================================================

    enableElevatorMusic() {
        this.elevatorMusicEnabled = true;
        if (!this.globalMuted && !this.elevatorMusicMuted) {
            this.startMusicCycle();
        }
    }

    disableElevatorMusic() {
        this.elevatorMusicEnabled = false;
        this.stopElevatorMusic();
    }

    private startMusicCycle() {
        if (this.globalMuted || this.elevatorMusicMuted) return;
        // if (!this.elevatorMusicEnabled || this.globalMuted || this.elevatorMusicMuted || this.elevatorMusic) return;


        const trackNumber = ((this.currentTrack - 1) % 5) + 1;

        this.elevatorMusic = new Audio(
            `/audio/music/elevator/MogilevLiftMach/elevator-music-${String(trackNumber).padStart(2, "0")}.mp3`
        );

        const audio = this.elevatorMusic;

        const handleEnded = () => {
            this.currentTrack = (this.currentTrack % 5) + 1;
            this.startMusicCycle();
        };

        audio.volume = this.volume.music.on ? this.volume.music.volume : 0;

        audio.addEventListener("ended", handleEnded);

        audio.addEventListener("canplay", () => {
            audio.currentTime = 0;
            audio.play().catch(() => { });
        }, { once: true });
    }

    stopElevatorMusic() {
        if (this.elevatorMusic) {
            this.elevatorMusic.pause();
            this.elevatorMusic = null;
        }
    }

    muteElevatorMusic() {
        this.elevatorMusicMuted = true;
        this.stopElevatorMusic();
    }

    unmuteElevatorMusic() {
        this.elevatorMusicMuted = false;
        if (this.elevatorMusicEnabled && !this.globalMuted) {
            this.startMusicCycle();
        }
    }

    // ============================================================
    // MOVEMENT SOUNDS
    // ============================================================

    playMovementStart(url: string) {
        if (this.globalMuted) return;
        if (!this.movementStart) this.movementStart = new Audio(url);
        this.movementStart.volume = this.volume.elevator.on ? this.volume.elevator.volume : 0;
        return this.movementStart.play().catch(() => { });
    }

    playMovementLoop(url: string) {
        if (this.globalMuted) return;
        if (!this.movementLoop) this.movementLoop = new Audio(url);
        this.movementLoop.volume = this.volume.elevator.on ? this.volume.elevator.volume : 0;
        this.movementLoop.loop = true;
        return this.movementLoop.play().catch(() => { });
    }

    stopMovementLoop() {
        if (this.movementLoop) {
            this.movementLoop.pause();
            this.movementLoop.currentTime = 0;
        }
    }

    playMovementEnd(url: string) {
        if (this.globalMuted) return;
        if (!this.movementEnd) this.movementEnd = new Audio(url);
        this.movementEnd.volume = this.volume.elevator.on ? this.volume.elevator.volume : 0;
        return this.movementEnd.play().catch(() => { });
    }

    // ============================================================
    // DOOR SOUNDS
    // ============================================================

    playDoorOpen(url: string) {
        if (this.globalMuted) return;
        this.doorOpen = new Audio(url);
        this.doorOpen.volume = this.volume.elevator.on ? this.volume.elevator.volume : 0;
        this.doorOpen.play().catch(() => { });
    }

    playDoorClose(url: string) {
        if (this.globalMuted) return;
        this.doorClose = new Audio(url);
        this.doorClose.volume = this.volume.elevator.on ? this.volume.elevator.volume : 0;
        this.doorClose.play().catch(() => { });
    }

    // ============================================================
    // VOICE ANNOUNCEMENTS
    // ============================================================

    playFloorNotification(floor: number) {
        if (this.globalMuted) return;

        this.floorAnnouncement = new Audio(
            `/audio/notifications/mlm-lcd/floors/floor-${floor}${[7,8].includes(floor) ? '.mp3' : '.m4a'}`
        );
        this.floorAnnouncement.volume = this.volume.elevator.on ? this.volume.elevator.volume : 0;

        // this.floorAnnouncement.play().catch(() => { });

        return new Promise((resolve, reject) => {
            if (this.floorAnnouncement) this.floorAnnouncement.play().catch((error) => { reject(error) });
            const handleEnded = () => {
                resolve(true);
                this.floorAnnouncement?.removeEventListener('ended', handleEnded);
            }
            this.floorAnnouncement?.addEventListener('ended', handleEnded);
        });
    }

    playDirectionNotification(direction: "UP" | "DOWN") {
        if (this.globalMuted) return;


        this.directionAnnouncement = new Audio(
            `/audio/notifications/mlm-lcd/direction/${direction.toLowerCase()}.m4a`
        );

        this.directionAnnouncement.volume = this.volume.elevator.on ? this.volume.elevator.volume : 0;

        this.directionAnnouncement.play().catch(() => { });
    }

    playEndMoveBeep(displayType: ElevatorDisplayTypes = "MLMLCD") {
        if (this.globalMuted) return;


        this.endMoveBeep = new Audio(
            (displayType === "MLMLCD") ? `/audio/notifications/mlm-lcd/end-move-beep.mp3` :
            (displayType === "TL-D70") ? `/audio/notifications/tl-d70/end-move-beep.mp3`
            : `/audio/notifications/tim-2/end-move-beep.m4a`
        );

        this.endMoveBeep.volume = this.volume.elevator.on ? this.volume.elevator.volume : 0;
        this.endMoveBeep.play().catch((error) => { });

        // return new Promise((resolve, reject) => {
        //     this.endMoveBeep?.play().catch((error) => { reject(error) });

        //     const endHandler = () => {
        //         this.endMoveBeep?.removeEventListener('ended', endHandler);
        //         resolve(true);
        //     }
        //     this.endMoveBeep?.addEventListener('ended', endHandler);
        // });
    }

    // ============================================================
    // ELEVATOR UI SOUNDS (button click)
    // ============================================================

    playElevatorButtonClick(url: string) {
        if (this.globalMuted) return;
        this.elevatorButtonClick = new Audio(url);
        this.elevatorButtonClick.volume = this.volume.elevator.on ? this.volume.elevator.volume : 0;
        this.elevatorButtonClick.play().catch(() => { });
    }

    // ============================================================
    // COURSEBOT UI SOUNDS
    // ============================================================

    initCoursebotSounds() {
        const data = [
            ["slot_click", "/audio/sound/coursebot/coursebot-slot-click-02.wav"],
            ["save_data", "/audio/sound/coursebot/coursebot-save-data.wav"],
            ["tab_switch_drop", "/audio/sound/coursebot/coursebot-switch-floor-drop.wav"],
            ["tab_button", "/audio/sound/coursebot/coursebot-tab-button-01.wav"],
            ["close", "/audio/sound/coursebot/coursebot-close-modal.wav"],
            ["select", "/audio/sound/coursebot/coursebot-select-button.wav"],
            ["slotinfo_button", "/audio/sound/coursebot/coursebot-slotinfo-button.wav"],
            ["watchlist_button", "/audio/sound/coursebot/coursebot-watch-list-button.wav"],
            ["watchlist_close_btn", "/audio/sound/coursebot/coursebot-watchlist-close-btn.wav"]
        ];
        data.forEach((([name, url]) => {
            if (!this.coursebotSounds[name]) this.coursebotSounds[name] = new Audio(url);
        }));

        this.coursebotMusic = new Audio("/audio/music/coursebot/coursebot-music.mp3");
    }

    playCoursebotSound(name: string, url?: string) {
        if (this.globalMuted) return;
        if (!this.coursebotSounds[name]) this.coursebotSounds[name] = new Audio(url);
        this.coursebotSounds[name].volume = this.volume.coursebot.ui.on ? this.volume.coursebot.ui.volume : 0;
        this.coursebotSounds[name]?.play().catch(() => { });
    }

    startCoursebotMusic(url?: string) {
        if (this.globalMuted) return;
        if (!this.coursebotMusic) this.coursebotMusic = new Audio(url);
        this.coursebotMusic.volume = this.volume.coursebot.music.on ? this.volume.coursebot.music.volume : 0;
        this.coursebotMusic.loop = true;
        this.coursebotMusic?.play().catch(() => { });
    }

    stopCoursebotMusic() {
        if (this.coursebotMusic) {
            this.coursebotMusic.pause();
            this.coursebotMusic = null;
        }
    }

    // ============================================================
    // GLOBAL CONTROL
    // ============================================================

    muteAll() {
        this.globalMuted = true;
        this.stopElevatorMusic();
        this.stopMovementLoop();
    }

    setVolume(data: Partial<typeof this.volume>) {
        this.volume = {
            ...this.volume,
            ...data,
        };

        if (this.elevatorMusic) this.elevatorMusic.volume = (this.volume.music.on) ? this.volume.music.volume : 0;
        if (this.movementStart) this.movementStart.volume = (this.volume.elevator.on) ? this.volume.elevator.volume : 0;
        if (this.movementLoop) this.movementLoop.volume = (this.volume.elevator.on) ? this.volume.elevator.volume : 0;
        if (this.movementEnd) this.movementEnd.volume = (this.volume.elevator.on) ? this.volume.elevator.volume : 0;
        if (this.doorOpen) this.doorOpen.volume = (this.volume.elevator.on) ? this.volume.elevator.volume : 0;
        if (this.doorClose) this.doorClose.volume = (this.volume.elevator.on) ? this.volume.elevator.volume : 0;
        if (this.floorAnnouncement) this.floorAnnouncement.volume = (this.volume.elevator.on) ? this.volume.elevator.volume : 0;
        if (this.directionAnnouncement) this.directionAnnouncement.volume = (this.volume.elevator.on) ? this.volume.elevator.volume : 0;
        if (this.elevatorButtonClick) this.elevatorButtonClick.volume = (this.volume.elevator.on) ? this.volume.elevator.volume : 0;
        if (this.coursebotMusic) this.coursebotMusic.volume = (this.volume.coursebot.music.on) ? this.volume.coursebot.music.volume : 0;
        for (const key in this.coursebotSounds) {
            this.coursebotSounds[key].volume = (this.volume.coursebot.ui.on) ? this.volume.coursebot.ui.volume : 0;
        }
    }

    unmuteAll() {
        this.globalMuted = false;
        if (this.elevatorMusicEnabled && !this.elevatorMusicMuted) {
            this.startMusicCycle();
        }
    }
}

export default AudioController.getInstance();
