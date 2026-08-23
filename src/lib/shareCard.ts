export interface ShareCardTemplate {
  id: string;
  name: string;
}

export const SHARE_TEMPLATES: ShareCardTemplate[] = [
  { id: 'classic', name: 'Classic' },
  { id: 'neon', name: 'Neon' },
  { id: 'typewriter', name: 'Typewriter' },
];

export interface ShareCardData {
  template: string;
  rarity: string;
  rarityIndex: number;
  totalRarities: number;
  chancePercent: string;
  valueLb: number;
  username: string;
  timestamp: number;
}

export function drawShareCard(canvas: HTMLCanvasElement, data: ShareCardData, accent: string) {
  const size = 1000;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const paper = data.template === 'typewriter';
  const bg = paper ? '#f5ecd7' : data.template === 'neon' ? '#050510' : '#0a0a0a';
  const ink = paper ? '#1a1a1a' : '#ffffff';

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  if (data.template === 'neon') {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, 520);
    g.addColorStop(0, `${accent}55`);
    g.addColorStop(1, '#00000000');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = paper ? '#555555' : '#ffffff66';
  ctx.font = 'bold 30px monospace';
  ctx.fillText('🎲 jasper-sona.pages.dev', size / 2, 52);

  const tile = { x: 150, y: 130, w: size - 300, h: size - 380 };
  ctx.strokeStyle = accent;
  ctx.lineWidth = 8;
  if (data.template === 'neon') {
    ctx.shadowColor = accent;
    ctx.shadowBlur = 36;
  }
  ctx.strokeRect(tile.x, tile.y, tile.w, tile.h);
  ctx.shadowBlur = 0;

  ctx.fillStyle = accent;
  ctx.font = 'bold 64px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(String(data.rarityIndex + 1), tile.x + 44, tile.y + 78);

  ctx.textAlign = 'right';
  ctx.font = '40px monospace';
  ctx.fillText(`${data.chancePercent}%`, tile.x + tile.w - 44, tile.y + 72);

  const words = data.rarity.split(/\s+/);
  const symbol = words.map((w) => w[0]).join('').slice(0, 3).toUpperCase();
  ctx.textAlign = 'center';
  ctx.font = '900 260px Georgia, serif';
  ctx.fillStyle = ink;
  if (data.template === 'neon') {
    ctx.shadowColor = accent;
    ctx.shadowBlur = 50;
  }
  ctx.fillText(symbol, size / 2, tile.y + tile.h / 2 + 60);
  ctx.shadowBlur = 0;

  ctx.fillStyle = accent;
  ctx.font = 'bold 52px monospace';
  ctx.fillText(data.rarity.toUpperCase(), size / 2, tile.y + tile.h / 2 + 160);

  ctx.strokeStyle = paper ? '#999999' : '#ffffff33';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(tile.x + 60, tile.y + tile.h / 2 + 210);
  ctx.lineTo(tile.x + tile.w - 60, tile.y + tile.h / 2 + 210);
  ctx.stroke();

  ctx.fillStyle = paper ? '#333333' : '#ffffff99';
  ctx.font = '34px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`VALUE ${data.valueLb.toLocaleString()} LB`, tile.x + 60, tile.y + tile.h - 56);
  ctx.textAlign = 'right';
  ctx.fillText(`OF ${data.totalRarities}`, tile.x + tile.w - 60, tile.y + tile.h - 56);

  ctx.textAlign = 'center';
  ctx.fillStyle = ink;
  ctx.font = 'bold 48px monospace';
  ctx.fillText(data.username, size / 2, size - 90);
  ctx.fillStyle = paper ? '#777777' : '#ffffff44';
  ctx.font = '26px monospace';
  ctx.fillText(new Date(data.timestamp).toLocaleDateString(), size / 2, size - 46);
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}
