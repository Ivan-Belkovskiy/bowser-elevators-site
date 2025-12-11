'use client';
import { MouseEventHandler, ReactNode } from "react";

export default function TabButton({ className, children, selected, value, onClick }: { className?: string, children?: ReactNode, selected?: boolean, value?: string, onClick?: MouseEventHandler<HTMLButtonElement> }) {
    return <button className={`${className} ${selected && 'selected'}`} onClick={onClick}>{children}</button>;
}