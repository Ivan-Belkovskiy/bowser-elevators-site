import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dir = searchParams.get('dir') || 'D:/Media/Video';

  if (!fs.existsSync(dir)) {
    return new Response(JSON.stringify([]), { status: 200 });
  }

  const items = fs.readdirSync(dir, { withFileTypes: true });
  const result = items.map(item => ({
    name: item.name,
    type: item.isDirectory() ? 'folder' : 'file',
    path: path.join(dir, item.name),
  }));

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
