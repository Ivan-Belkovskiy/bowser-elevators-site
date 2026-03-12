'use client';

import { LevelBotMode, LevelBotTransitionState } from "../LevelBotModal";
import "./LevelBotHead.css";

export default function LevelBotHead({
    message,
    mode,
    transitionState
}: {
    message: string;
    mode: LevelBotMode;
    transitionState: LevelBotTransitionState;
}) {
    const isClosed = transitionState === "closing" || transitionState === "closed";

    return (
        <div className="levelbot-head__container" data-mode={mode}>
            <div className="levelbot-head__side-part levelbot-head__left"></div>
            <div className="levelbot-head__side-part levelbot-head__right"></div>

            <div className="levelbot-head">
                <span className="levelbot-head__text">{message}</span>

                <div className={`levelbot-head__transition top ${isClosed ? "active" : ""}`}></div>
                <div className={`levelbot-head__transition bottom ${isClosed ? "active" : ""}`}></div>
            </div>
        </div>
    );
}
