'use client';

import { useEffect, useRef, useState } from "react";
import ProfileButton from "../ProfileButton/ProfileButton";
import ProfileMenu from "../ProfileMenu/ProfileMenu";
import ProfileMenuItem from "../ProfileMenuItem/ProfileMenuItem";

export default function ProfileDropdown() {
    const [isOpened, setIsOpened] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpened(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="profile-dropdown">
            <ProfileButton onClick={() => setIsOpened(!isOpened)} />
            {isOpened && (
                <ProfileMenu>
                    <ProfileMenuItem>
                        <a href="/">Войти</a>
                    </ProfileMenuItem>
                    <ProfileMenuItem>
                        <a href="/">Создать аккаунт</a>
                    </ProfileMenuItem>
                </ProfileMenu>
            )}
        </div>
    );
}