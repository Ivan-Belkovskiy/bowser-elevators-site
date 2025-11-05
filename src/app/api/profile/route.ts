import { NextResponse } from "next/server";

export async function GET() {
    const profile = {
        name: 'Лифти',
        avatar: '/images/blank-profile.svg',
        levels: ['Level 1', 'Level 2']
    };

    return NextResponse.json(profile);
}