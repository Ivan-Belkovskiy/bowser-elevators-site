'use client';
import { Profile } from '@/types/profile';
import { useEffect, useState } from 'react';
import './ProfileButton.css';
export default function ProfileButton({ imageUrl, onClick }: { imageUrl?: string, onClick?: () => any }) {
    const [profile, setProfile] = useState<Profile | null>(null);
    useEffect(() => {
        fetch('/api/profile')
        .then(res => res.json())
        .then(data => setProfile(data));
    }, []);
    return (
        <button className="profile-button" onClick={onClick}>
            <img width={50} height={50} src={profile?.avatar || "/images/blank-profile.svg"} alt="Profile Icon" className="profile-button__image" />
        </button>
    );
}