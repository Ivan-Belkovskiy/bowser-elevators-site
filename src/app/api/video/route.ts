import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get("path");

  if (!filePath) {
    return new NextResponse("Missing path", { status: 400 });
  }

  const realPath = filePath;

  if (!fs.existsSync(realPath)) {
    return new NextResponse("File not found", { status: 404 });
  }

  const stat = fs.statSync(realPath);
  const fileSize = stat.size;

  const range = req.headers.get("range");

  if (!range) {
    return new NextResponse("Range header required", { status: 416 });
  }

  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

  const chunkSize = end - start + 1;

  const file = fs.createReadStream(realPath, { start, end });

  return new NextResponse(file as any, {
    status: 206,
    headers: {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize.toString(),
      "Content-Type": "video/mp4"
    }
  });
}
