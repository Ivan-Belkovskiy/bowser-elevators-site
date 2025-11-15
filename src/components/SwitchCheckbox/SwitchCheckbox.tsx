'use client';
import { MouseEventHandler, useEffect, useState } from "react";
import "./SwitchCheckbox.css";

export default function SwitchCheckbox({ value, onChange, text }: { value?: boolean, onChange?: (value: boolean) => any, text?: [string?, string?] }) {
    const [val, setVal] = useState<boolean>(value || false);
    const changeValue = (state: boolean) => {
        setVal(state);
        onChange?.(state);
    }

    useEffect(() => {
        setVal(value || false);
    }, [value]);
    return (
        <div className="switch-checkbox">
            <button
                className={`switch-checkbox__button on-button ${val && `active`}`}
                onClick={(e) => changeValue(true)}
                aria-pressed={val}
            >
                {text?.[0] || 'ON'}
            </button>
            <button
                className={`switch-checkbox__button off-button ${!val && `active`}`}
                onClick={(e) => changeValue(false)}
                aria-pressed={!val}
            >
                {text?.[1] || 'OFF'}
            </button>
        </div>
    );
}