import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');

  if (!filePath || !fs.existsSync(filePath)) {
    return new Response('Файл не найден', { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const stream = fs.createReadStream(filePath);

  return new Response(stream as any, {
    status: 200,
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Length': stat.size.toString(),
    },
  });
}
