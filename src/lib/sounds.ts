let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, startAt: number, duration: number, gain: number) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(0, ac.currentTime + startAt);
  amp.gain.linearRampToValueAtTime(gain, ac.currentTime + startAt + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + startAt + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start(ac.currentTime + startAt);
  osc.stop(ac.currentTime + startAt + duration + 0.05);
}

export function playRollStart() {
  tone(180, 0, 0.12, 0.05);
  tone(240, 0.06, 0.12, 0.04);
}

export function playWin(intensity01: number) {
  const base = 440 * Math.pow(2, intensity01);
  tone(base, 0, 0.18, 0.08);
  tone(base * 1.25, 0.09, 0.18, 0.07);
  if (intensity01 > 0.5) tone(base * 1.5, 0.18, 0.22, 0.07);
  if (intensity01 > 0.8) tone(base * 2, 0.27, 0.3, 0.06);
}
