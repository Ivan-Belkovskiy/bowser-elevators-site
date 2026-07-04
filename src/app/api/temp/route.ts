import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const res =  NextResponse.json({
        data: "Welcome from Elevator Video Player!!!"
    });
    res.headers.set('Access-Control-Allow-Origin', '*');
    return res;
}