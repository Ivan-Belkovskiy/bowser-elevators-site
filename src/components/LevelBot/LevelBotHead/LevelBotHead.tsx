'use client';

import { LevelBotTransitionState } from "../LevelBotModal";
import "./LevelBotHead.css";

export default function LevelBotHead({ message, transitionState }: { message: string, transitionState: LevelBotTransitionState }) {
    return (
        <div className='levelbot-head__container'>
            <div className="levelbot-head__side-part levelbot-head__left"></div>
            <div className="levelbot-head__side-part levelbot-head__right"></div>

            <div className="levelbot-head">
                <span className='levelbot-head__text'>{message}</span>

                <div className={`levelbot-head__transition top ${transitionState === "closing" || transitionState === "closed" ? "active" : ""}`}></div>
                <div className={`levelbot-head__transition bottom ${transitionState === "closing" || transitionState === "closed" ? "active" : ""}`}></div>

            </div>
        </div>
    );
}
