import { CSSProperties, MouseEvent, MouseEventHandler, useState } from "react";
import "./CustomButton.css";

export default function CustomButton({
    text,
    image,
    className,
    styles,
    disabled,
    tooltip,
    tooltipClassName,
    onClick,
    onMouseOver,
    onMouseLeave,

}: {
    text?: string,
    image?: string,
    className?: string,
    styles?: CSSProperties,
    disabled?: boolean,
    onClick?: MouseEventHandler<HTMLButtonElement>,
    onMouseOver?: MouseEventHandler<HTMLButtonElement>,
    onMouseLeave?: MouseEventHandler<HTMLButtonElement>,
    tooltip?: string,
    tooltipClassName?: string,
}) {
    const [mouseOver, setMouseOver] = useState<boolean>(false);
    const mouseOverHandler = (e: MouseEvent<HTMLButtonElement>) => {
        setMouseOver(true);
        onMouseOver?.(e);
    }
    const mouseLeaveHandler = (e: MouseEvent<HTMLButtonElement>) => {
        setMouseOver(false);
        onMouseLeave?.(e);
    }
    return (
        <button
            className={"custom-button " + className}
            style={styles}
            onClick={onClick}
            disabled={disabled}
            onMouseOver={mouseOverHandler}
            onMouseLeave={mouseLeaveHandler}
        >
            {image ? <img src={image} className="custom-button__image" /> : text}
            {(tooltip && mouseOver && !disabled) ? (
                <div className={"custom-button__tooltip " + tooltipClassName}>{tooltip}</div>
            ) : <></>}
        </button>
    );
}