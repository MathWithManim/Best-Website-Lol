import { useEffect, useRef, useState } from 'react';

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const W = 320;
const H = 430;
const PEG_R = 4;
const BALL_R = 6;
const ROWS = 8;
const BUCKETS = [10, 1, 0.5, 2, 0.2, 2, 0.5, 1, 10];
const BUCKET_W = W / BUCKETS.length;

const buildPegs = (): Array<{ x: number; y: number }> => {
  const pegs: Array<{ x: number; y: number }> = [];
  for (let row = 0; row < ROWS; row++) {
    const count = row + 3;
    const y = 60 + row * 32;
    for (let col = 0; col < count; col++) {
      pegs.push({ x: W / 2 - ((count - 1) / 2) * 28 + col * 28, y });
    }
  }
  return pegs;
};

const PEGS = buildPegs();

const Plinko = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [falling, setFalling] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const drop = () => {
    if (falling) return;
    setFalling(true);
    setResult(null);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      setFalling(false);
      return;
    }

    const ball: Ball = {
      x: W / 2 + (Math.random() * 20 - 10),
      y: -BALL_R,
      vx: Math.random() * 1.6 - 0.8,
      vy: 0,
    };
    const trail: Array<{ x: number; y: number }> = [];

    const step = () => {
      ball.vy = Math.min(ball.vy + 0.22, 6.5);
      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x < BALL_R) {
        ball.x = BALL_R;
        ball.vx = Math.abs(ball.vx) * 0.8 + 0.3;
      }
      if (ball.x > W - BALL_R) {
        ball.x = W - BALL_R;
        ball.vx = -Math.abs(ball.vx) * 0.8 - 0.3;
      }
      for (const peg of PEGS) {
        const dx = ball.x - peg.x;
        const dy = ball.y - peg.y;
        const dist = Math.hypot(dx, dy);
        if (dist < PEG_R + BALL_R && dist > 0.001) {
          const nx = dx / dist;
          const ny = dy / dist;
          ball.x = peg.x + nx * (PEG_R + BALL_R);
          ball.y = peg.y + ny * (PEG_R + BALL_R);
          const speed = Math.hypot(ball.vx, ball.vy) * 0.72;
          const angle = Math.atan2(ny, nx) + (Math.random() * 0.5 - 0.25);
          ball.vx = Math.cos(angle) * speed;
          ball.vy = Math.abs(Math.sin(angle) * speed) + 0.4;
        }
      }

      trail.push({ x: ball.x, y: ball.y });
      if (trail.length > 14) trail.shift();

      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = '#5D3A1A';
      for (const peg of PEGS) {
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, PEG_R, 0, Math.PI * 2);
        ctx.fill();
      }

      BUCKETS.forEach((mult, i) => {
        ctx.fillStyle = mult >= 10 ? '#C0392B' : mult >= 2 ? '#C9962E' : '#D2B48C';
        ctx.fillRect(i * BUCKET_W + 1, H - 30, BUCKET_W - 2, 28);
        ctx.fillStyle = '#F5E6CA';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`x${mult}`, i * BUCKET_W + BUCKET_W / 2, H - 12);
      });

      trail.forEach((p, i) => {
        ctx.globalAlpha = (i / trail.length) * 0.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, BALL_R * (i / trail.length), 0, Math.PI * 2);
        ctx.fillStyle = '#C0392B';
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = '#C9962E';
      ctx.fill();
      ctx.strokeStyle = '#F5E6CA';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (ball.y >= H - 32) {
        const idx = Math.min(BUCKETS.length - 1, Math.max(0, Math.floor(ball.x / BUCKET_W)));
        const won = BUCKETS[idx];
        setResult(`Bucket ${idx + 1} · x${won} multiplier`);
        setFalling(false);
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  };

  // Cancel any in-flight animation frame on unmount.
  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="w-full max-w-[320px] rounded-2xl border border-primary/20 dark:border-[#f4d5ad]/20 bg-secondary/20 dark:bg-[#1a120b]/60"
      />
      <button
        type="button"
        onClick={drop}
        disabled={falling}
        className="cursor-pointer rounded-xl bg-primary px-10 py-3 font-mono text-sm font-bold text-bg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 dark:bg-accent dark:text-[#1a120b]"
      >
        {falling ? 'Falling...' : 'Drop the ball'}
      </button>
      <p className="h-5 font-mono text-sm" role="status" aria-live="polite">
        {result}
      </p>
    </div>
  );
};

export default Plinko;
