// Weather and ambient effects, drawn in chunky pixels on a canvas behind the
// cards. Content never calls this directly: a card or death names a scene in
// content/world.json, and a scene lists these effects by name.
//
// The canvas is a quarter of the screen's resolution, scaled up with
// image-rendering: pixelated, and it updates 20 times a second. Both make it
// look 8-bit, and the low frame rate is easy on a phone battery.

export const EFFECT_NAMES = ['rain', 'lightning', 'embers', 'smoke', 'flames', 'sparks', 'dust', 'stars', 'fireflies', 'grain', 'birds', 'shake'];

const PX = 4;
const FRAME_MS = 50;
const rand = (a, b) => a + Math.random() * (b - a);
const chance = (p) => Math.random() < p;

export function createFx(canvas, { colors, onShake = () => {} }) {
  const ctx = canvas.getContext('2d');
  const c = (ch, fallback) => colors[ch] || fallback;
  let W = 0;
  let H = 0;
  let active = new Set();
  let parts = [];
  let stars = [];
  let heat = null;
  let heatW = 0;
  let heatH = 0;
  let fireImage = null;
  let frame = 0;
  let still = false;
  let enabled = true;
  let paused = false;
  let timer = 0;
  let last = 0;
  let flash = [];
  let bolt = null;
  let quiet = [];
  const next = {};

  // Flame colours, cool to hot, as RGBA
  const hex = (h, a = 255) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), a];
  const firePalette = [
    [0, 0, 0, 0], hex(c('R', '#8e2a22'), 150), hex(c('R', '#8e2a22'), 210), hex(c('r', '#d9442e'), 230),
    hex(c('r', '#d9442e')), hex(c('o', '#f08a2e')), hex(c('o', '#f08a2e')), hex(c('y', '#f2c94c')),
    hex(c('y', '#f2c94c')), hex(c('w', '#fff5e6')),
  ];

  function resize() {
    W = Math.ceil(window.innerWidth / PX);
    H = Math.ceil(window.innerHeight / PX);
    canvas.width = W;
    canvas.height = H;
    stars = [];
    const count = Math.round((W * H) / 150);
    for (let i = 0; i < count; i++) {
      stars.push({ x: Math.floor(rand(0, W)), y: Math.floor(rand(0, H * 0.7)), phase: Math.floor(rand(0, 40)), rate: Math.floor(rand(12, 40)), big: chance(0.08) });
    }
    heat = null;
    if (still) drawStill();
  }

  // ---- particle helpers

  const add = (p) => { parts.push(p); return p; };
  const count = (kind) => parts.reduce((n, p) => n + (p.kind === kind ? 1 : 0), 0);

  function spawn() {
    if (active.has('rain')) {
      const want = Math.round((W * H) / 300);
      for (let n = count('rain'); n < want; n++) {
        add({ kind: 'rain', x: rand(0, W + H * 0.2), y: rand(-H * 0.2, H), vx: -1, vy: rand(5, 7), color: chance(0.3) ? c('u', '#4c8ad6') : c('l', '#d2ccc2'), alpha: rand(0.35, 0.6) });
      }
    }
    if (active.has('embers')) {
      for (let i = 0; i < 2; i++) {
        if (chance(0.7)) add({ kind: 'ember', x: rand(0, W), y: H + 1, vx: rand(-0.3, 0.3), vy: -rand(0.6, 1.4), life: 0, max: rand(40, 90), size: chance(0.12) ? 2 : 1, wob: rand(0, 6) });
      }
    }
    if (active.has('smoke') && frame % 3 === 0) {
      add({ kind: 'smoke', x: W * 0.5 + rand(-W * 0.35, W * 0.35), y: H + 2, vx: rand(0.05, 0.25), vy: -rand(0.25, 0.55), life: 0, max: rand(90, 150), color: chance(0.5) ? c('e', '#9b958d') : c('l', '#d2ccc2') });
    }
    if (active.has('sparks') && frame >= (next.sparks || 0)) {
      next.sparks = frame + Math.round(rand(10, 22));
      // Burst where the card doesn't cover: the side margins or above the card
      const side = chance(0.6);
      const ox = side ? (chance(0.5) ? rand(W * 0.02, W * 0.14) : rand(W * 0.86, W * 0.98)) : rand(W * 0.1, W * 0.9);
      const oy = side ? rand(H * 0.3, H * 0.8) : rand(H * 0.13, H * 0.3);
      const n = Math.round(rand(12, 18));
      for (let i = 0; i < n; i++) {
        const a = rand(0, Math.PI * 2);
        const s = rand(0.8, 2.6);
        add({ kind: 'spark', x: ox, y: oy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.8, life: 0, max: rand(8, 18), size: chance(0.25) ? 2 : 1 });
      }
    }
    if (active.has('dust')) {
      const want = Math.round((W * H) / 450);
      for (let n = count('dust'); n < want; n++) {
        add({ kind: 'dust', x: rand(0, W), y: rand(H * 0.3, H), vx: rand(0.6, 1.6), phase: rand(0, 6), color: chance(0.5) ? c('Y', '#c9962a') : c('b', '#8f5b33'), alpha: rand(0.3, 0.6), size: chance(0.2) ? 2 : 1 });
      }
    }
    if (active.has('fireflies')) {
      for (let n = count('firefly'); n < 10; n++) {
        add({ kind: 'firefly', x: rand(0, W), y: rand(H * 0.3, H * 0.95), vx: rand(-0.3, 0.3), vy: rand(-0.3, 0.3), phase: Math.floor(rand(0, 30)) });
      }
    }
    if (active.has('grain')) {
      const want = Math.round((W * H) / 450);
      for (let n = count('grain'); n < want; n++) {
        add({ kind: 'grain', x: rand(0, W), y: rand(-H * 0.1, H), vy: rand(0.4, 0.8), phase: rand(0, 6), color: chance(0.5) ? c('y', '#f2c94c') : c('Y', '#c9962a') });
      }
    }
    if (active.has('birds') && frame >= (next.birds || 0)) {
      next.birds = frame + Math.round(rand(70, 150));
      const y = rand(H * 0.06, H * 0.3);
      const n = Math.round(rand(3, 5));
      for (let i = 0; i < n; i++) {
        add({ kind: 'bird', x: -4 - i * rand(3, 6), y: y + rand(-4, 4), vx: rand(0.8, 1.2), phase: Math.floor(rand(0, 6)) });
      }
    }
    if (active.has('lightning') && !still && frame >= (next.lightning || 0)) {
      next.lightning = frame + Math.round(rand(50, 120));
      flash = [0.35, 0, 0.22, 0.08];
      const pts = [];
      let x = rand(W * 0.1, W * 0.9);
      let y = 0;
      const end = rand(H * 0.3, H * 0.6);
      while (y < end) { pts.push([Math.round(x), Math.round(y)]); x += Math.round(rand(-2, 2)); y += Math.round(rand(2, 4)); }
      bolt = { pts, life: 2 };
    }
    if (active.has('shake') && !still && frame >= (next.shake || 0)) {
      next.shake = frame + Math.round(rand(80, 150));
      onShake();
    }
  }

  function update() {
    for (const p of parts) {
      switch (p.kind) {
        case 'rain':
          p.x += p.vx; p.y += p.vy;
          if (p.y > H) {
            if (!still && chance(0.5)) {
              add({ kind: 'splash', x: p.x, y: H - 1, vx: -0.6, vy: -0.8, life: 0, max: 3 });
              add({ kind: 'splash', x: p.x, y: H - 1, vx: 0.6, vy: -0.8, life: 0, max: 3 });
            }
            if (active.has('rain')) { p.y = rand(-8, 0); p.x = rand(0, W + H * 0.2); } else p.dead = true;
          }
          break;
        case 'ember':
          p.life += 1;
          p.vx += Math.sin((frame + p.wob * 10) * 0.2) * 0.04;
          p.x += p.vx; p.y += p.vy;
          if (p.life > p.max || p.y < -2) p.dead = true;
          break;
        case 'smoke':
          p.life += 1; p.x += p.vx; p.y += p.vy;
          if (p.life > p.max) p.dead = true;
          break;
        case 'spark':
        case 'splash':
          p.life += 1; p.vy += 0.14; p.x += p.vx; p.y += p.vy;
          if (p.life > p.max) p.dead = true;
          break;
        case 'dust':
          p.x += p.vx; p.y += Math.sin(frame * 0.1 + p.phase) * 0.15;
          if (p.x > W + 2) { if (active.has('dust')) { p.x = -2; p.y = rand(H * 0.3, H); } else p.dead = true; }
          break;
        case 'firefly':
          p.vx = Math.max(-0.4, Math.min(0.4, p.vx + rand(-0.08, 0.08)));
          p.vy = Math.max(-0.4, Math.min(0.4, p.vy + rand(-0.08, 0.08)));
          p.x = (p.x + p.vx + W) % W;
          p.y = Math.max(H * 0.25, Math.min(H - 2, p.y + p.vy));
          if (!active.has('fireflies')) p.dead = true;
          break;
        case 'grain':
          p.y += p.vy; p.x += Math.sin(frame * 0.07 + p.phase) * 0.3;
          if (p.y > H) { if (active.has('grain')) { p.y = rand(-6, 0); p.x = rand(0, W); } else p.dead = true; }
          break;
        case 'bird':
          p.x += p.vx; p.y += Math.sin((frame + p.phase) * 0.3) * 0.2;
          if (p.x > W + 4) p.dead = true;
          break;
        default:
          break;
      }
    }
    parts = parts.filter((p) => !p.dead);
    if (active.has('flames')) updateFire();
    else heat = null;
    if (bolt && --bolt.life < 0) bolt = null;
  }

  // The classic demoscene fire: the bottom row burns, and each pixel above
  // takes the heat of the one below it, minus a little, nudged sideways.
  function updateFire() {
    const w = W;
    const h = Math.max(8, Math.min(30, Math.round(H * 0.16)));
    if (!heat || heatW !== w || heatH !== h) {
      heat = new Uint8Array(w * h);
      heatW = w;
      heatH = h;
      fireImage = ctx.createImageData(w, h);
    }
    const top = firePalette.length - 1;
    for (let x = 0; x < w; x++) heat[(h - 1) * w + x] = chance(0.85) ? top : top - 2;
    for (let y = 1; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const src = y * w + x;
        const r = Math.floor(Math.random() * 4);
        const dst = src - w - (r & 1) + 1;
        if (dst >= 0 && dst < heat.length) heat[dst] = Math.max(0, heat[src] - ((r & 2) ? 1 : 0) - (chance(0.08) ? 1 : 0));
      }
    }
  }

  // ---- drawing

  function px(x, y, color, alpha = 1, w = 1, h = 1) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (heat) {
      const d = fireImage.data;
      for (let i = 0; i < heat.length; i++) {
        const col = firePalette[heat[i]];
        d[i * 4] = col[0]; d[i * 4 + 1] = col[1]; d[i * 4 + 2] = col[2]; d[i * 4 + 3] = col[3];
      }
      ctx.putImageData(fireImage, 0, H - heatH);
    }
    if (active.has('stars')) {
      for (const s of stars) {
        const on = ((frame + s.phase) % s.rate) > 2;
        const color = s.big ? c('y', '#f2c94c') : c('w', '#fff5e6');
        px(s.x, s.y, color, on ? (s.big ? 0.9 : 0.55) : 0.15);
        if (s.big && on) {
          px(s.x - 1, s.y, color, 0.3); px(s.x + 1, s.y, color, 0.3);
          px(s.x, s.y - 1, color, 0.3); px(s.x, s.y + 1, color, 0.3);
        }
      }
    }
    for (const p of parts) {
      switch (p.kind) {
        case 'smoke': {
          const t = p.life / p.max;
          const size = Math.round(2 + t * 4);
          px(p.x - size / 2, p.y - size / 2, p.color, 0.32 * (1 - t), size, size);
          break;
        }
        case 'dust': px(p.x, p.y, p.color, p.alpha, p.size, p.size); break;
        case 'grain': px(p.x, p.y, p.color, 0.8, (frame + Math.round(p.phase * 3)) % 8 < 4 ? 1 : 2, (frame + Math.round(p.phase * 3)) % 8 < 4 ? 2 : 1); break;
        case 'rain': px(p.x, p.y, p.color, p.alpha, 1, 3); break;
        case 'splash': px(p.x, p.y, c('l', '#d2ccc2'), 0.5); break;
        case 'ember': {
          const t = p.life / p.max;
          const color = t < 0.3 ? c('y', '#f2c94c') : t < 0.6 ? c('o', '#f08a2e') : t < 0.85 ? c('r', '#d9442e') : c('R', '#8e2a22');
          if (!chance(0.1) || still) px(p.x, p.y, color, 0.95, p.size, p.size);
          break;
        }
        case 'spark': {
          const t = p.life / p.max;
          const s = t < 0.4 ? p.size : 1;
          px(p.x, p.y, t < 0.3 ? c('w', '#fff5e6') : t < 0.7 ? c('y', '#f2c94c') : c('o', '#f08a2e'), 1, s, s);
          break;
        }
        case 'firefly': {
          const glow = ((frame + p.phase) % 30) < 18;
          px(p.x, p.y, c('y', '#f2c94c'), glow ? 1 : 0.35);
          if (glow) { px(p.x - 1, p.y, c('g', '#62a843'), 0.35); px(p.x + 1, p.y, c('g', '#62a843'), 0.35); px(p.x, p.y - 1, c('g', '#62a843'), 0.35); px(p.x, p.y + 1, c('g', '#62a843'), 0.35); }
          break;
        }
        case 'bird': {
          const up = ((frame + p.phase) % 6) < 3;
          const col = c('c', '#efe2c2');
          px(p.x, p.y, col, 0.85);
          px(p.x - 1, p.y + (up ? -1 : 0), col, 0.85);
          px(p.x + 1, p.y + (up ? -1 : 0), col, 0.85);
          break;
        }
        default: break;
      }
    }
    if (bolt) for (const [x, y] of bolt.pts) px(x, y, c('w', '#fff5e6'), 0.95, 1, 3);
    drawQuiet();
    if (flash.length) {
      const a = flash.shift();
      if (a > 0) px(0, 0, c('w', '#fff5e6'), a, W, H);
    }
    ctx.globalAlpha = 1;
  }

  // Weather thins out behind text, so rain and embers never cross the
  // words: each quiet box fades what's under it, with a one-step pixel edge.
  function drawQuiet() {
    if (!quiet.length) return;
    const sx = W / window.innerWidth;
    const sy = H / window.innerHeight;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000';
    for (const r of quiet) {
      const x = Math.floor(r.left * sx);
      const y = Math.floor(r.top * sy);
      const w = Math.ceil(r.right * sx) - x;
      const h = Math.ceil(r.bottom * sy) - y;
      ctx.globalAlpha = 0.45;
      ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
      ctx.globalAlpha = 0.65;
      ctx.fillRect(x, y, w, h);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  // Boxes (in CSS pixels, like getBoundingClientRect) where text sits.
  function setQuiet(rects) {
    quiet = rects.filter((r) => r && r.right > r.left && r.bottom > r.top);
    if (still && enabled) draw();
  }

  function tick(now) {
    timer = 0;
    if (paused || !enabled) return;
    if (!last) last = now - FRAME_MS;
    if (now - last >= FRAME_MS) {
      // Catch up on time, not frames, so weather moves at the same speed on
      // a phone in low-power mode (or a throttled tab): up to 6 steps a draw.
      const steps = Math.min(6, Math.floor((now - last) / FRAME_MS));
      last = steps === 6 ? now : last + steps * FRAME_MS;
      for (let i = 0; i < steps; i++) { frame += 1; spawn(); update(); }
      draw();
    }
    if (active.size || parts.length || heat) timer = requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, W, H);
  }

  function start() {
    if (!timer && !paused && enabled && !still) timer = requestAnimationFrame(tick);
  }

  // Reduced motion: settle the weather for a moment, then draw one still frame.
  function drawStill() {
    parts = [];
    heat = null;
    for (let i = 0; i < 80; i++) { frame += 1; spawn(); update(); }
    draw();
  }

  function set(names, opts = {}) {
    enabled = opts.enabled !== false;
    still = !!opts.reduceMotion;
    const list = new Set(names.filter((n) => EFFECT_NAMES.includes(n)));
    const added = [...list].filter((n) => !active.has(n));
    active = list;
    if (!enabled) { parts = []; heat = null; ctx.clearRect(0, 0, W, H); return; }
    if (added.includes('shake') && !still) { next.shake = frame + Math.round(rand(80, 150)); onShake(); }
    if (added.includes('lightning')) next.lightning = frame + Math.round(rand(10, 40));
    if (still) { drawStill(); return; }
    start();
  }

  function setPaused(value) {
    paused = value;
    if (!paused) start();
  }

  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => setPaused(document.hidden));
  return { set, setPaused, resize, setQuiet };
}
