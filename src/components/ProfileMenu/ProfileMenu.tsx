'use client';
import { Children, isValidElement, ReactNode } from "react";
import "./ProfileMenu.css";
import ProfileMenuItem from "../ProfileMenuItem/ProfileMenuItem";

export default function ProfileMenu({ children }: { children?: ReactNode }) {
    const filteredElements = Children.toArray(children).filter(element => isValidElement(element) && element.type === ProfileMenuItem);
    return (
        <div className="profile-menu">
            {filteredElements}
        </div>
    );
}