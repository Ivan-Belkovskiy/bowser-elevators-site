'use client';
import { ReactNode } from "react";
import "./ProfileMenuItem.css";

export default function ProfileMenuItem({ children }: { children?: ReactNode }) {
    return (
        <div className="profile-menu-item">{children}</div>
    );
}