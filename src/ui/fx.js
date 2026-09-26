// Weather and ambient effects, drawn as flat shapes on a canvas behind the
// cards, in the same flat, Reigns-like style as the art: slanted rain
// streaks, round embers, one-colour smoke clouds, a line of flame tongues.
// Content never calls this directly: a card or death names a scene in
// content/world.json, and a scene lists these effects by name.
// tools/fx.html previews any scene.
//
// The canvas matches the screen's resolution (up to 2x, plenty for soft
// shapes) and redraws about 30 times a second. Motion is measured in seconds,
// not frames, so it looks smooth and stays easy on a phone battery. Nothing
// runs while there's nothing to draw or the page is hidden, and the weather
// thins out behind words (see setQuiet).

export const EFFECT_NAMES = ['rain', 'lightning', 'embers', 'smoke', 'flames', 'sparks', 'dust', 'stars', 'fireflies', 'grain', 'birds', 'shake'];

// The effects keep their own flat palette
const WHITE = '#fff5e6';
const CREAM = '#efe2c2';
const RAIN = '#cfd6de'; // a cool light grey, as in the flat mock
const GREY = '#9b958d';
const BLUE = '#4c8ad6';
const RED = '#d9442e';
const ORANGE = '#f08a2e';
const YELLOW = '#f2c94c';
const OCHRE = '#c9962a';
const BROWN = '#8f5b33';

const FPS = 30;
const FRAME_MS = 1000 / FPS;
const MAX_STEP = 0.05; // seconds: a longer gap is simulated in steps this long
const CATCH_UP = 0.3; // seconds: the most lost time one frame makes up
const SETTLE = 5; // seconds of weather simulated for a still frame
const MAX_PARTS = 250;
const REF_AREA = 390 * 844; // the phone the densities are tuned on
const TAU = Math.PI * 2;

const rand = (a, b) => a + Math.random() * (b - a);
const chance = (p) => Math.random() < p;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const approach = (v, to, step) => (v < to ? Math.min(to, v + step) : Math.max(to, v - step));

// A `colors` option is still accepted, and ignored: the palette lives here.
export function createFx(canvas, { onShake = () => {} } = {}) {
  const ctx = canvas.getContext('2d');
  let W = 1; // the canvas's size and position, in CSS pixels
  let H = 1;
  let ox = 0;
  let oy = 0;
  let enabled = true;
  let still = false;
  let paused = false;
  let timer = 0; // the pending animation frame
  let nap = 0; // the pending wake-up, while only timed events are left
  let sleptAt = 0;
  let last = 0;
  let clock = 0; // seconds of weather simulated so far
  let quiet = [];
  const on = {};
  for (const n of EFFECT_NAMES) on[n] = false;

  // Effects that fade in and out as a whole, from 0 to 1
  let flameLevel = 0;
  let starLevel = 0;
  let smokeLevel = 0;

  // When the timed effects next happen, in clock seconds
  let nextSparks = 0;
  let nextBirds = 0;
  let birdWay = 1; // which way the flocks fly, picked when birds arrive
  let nextBolt = 0;
  let nextShake = 0;
  let strike = -1; // seconds since the last lightning strike, or -1
  let emberDue = 0;
  let puffDue = 0;

  // How much of each, for this screen size (set in resize)
  const want = { rain: 0, dust: 0, grain: 0, flies: 0, embers: 0, puffs: 0 };

  // ---- particles: pooled, so a running scene allocates nothing

  const pool = [];
  const drops = [];
  const splashes = [];
  const embers = [];
  const puffs = [];
  const sparks = [];
  const motes = [];
  const flies = [];
  const grains = [];
  const birds = [];
  const lists = [drops, splashes, embers, puffs, sparks, motes, flies, grains, birds];
  let live = 0;

  function add(list) {
    if (live >= MAX_PARTS) return null;
    const p = pool.pop() || { x: 0, y: 0, vx: 0, vy: 0, t: 0, life: 0, r: 0, c: 0, a: 0, b: 0, ph: 0, h: 0, dead: false };
    p.t = 0;
    p.dead = false;
    list.push(p);
    live += 1;
    return p;
  }

  function sweep(list) {
    let j = 0;
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      if (p.dead) { pool.push(p); live -= 1; } else list[j++] = p;
    }
    list.length = j;
  }

  function clearAll() {
    for (const list of lists) {
      for (const p of list) pool.push(p);
      list.length = 0;
    }
    live = 0;
    strike = -1;
  }

  // ---- rain: thin slanted streaks with round caps. Nearer drops are
  // brighter, longer and faster. Small arcs splash up at the bottom edge.

  const SLANT = 0.26; // sideways drift for each pixel of fall
  const SX = SLANT / Math.hypot(1, SLANT);
  const SY = 1 / Math.hypot(1, SLANT);
  const RAIN_COLOURS = [RAIN, BLUE];
  const RAIN_ALPHAS = [0.32, 0.44, 0.56];

  function newDrop(p, y) {
    const near = Math.floor(Math.random() * 3);
    p.c = (chance(0.3) ? 3 : 0) + near; // colour and nearness, for drawing in batches
    p.vy = rand(480, 540) + near * 80;
    p.r = rand(13.5, 16) + near * 2; // streak length, 14 to 20
    p.x = rand(-10, W + 10);
    p.y = y;
  }

  function splash(x) {
    const p = add(splashes);
    if (!p) return;
    p.x = clamp(x, 8, W - 8);
    p.life = 0.3;
  }

  function drawRain() {
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for (let k = 0; k < 6; k++) {
      let n = 0;
      ctx.beginPath();
      for (let i = 0; i < drops.length; i++) {
        const p = drops[i];
        if (p.c !== k) continue;
        ctx.moveTo(p.x + SX * p.r, p.y - SY * p.r);
        ctx.lineTo(p.x, p.y);
        n += 1;
      }
      if (!n) continue;
      ctx.strokeStyle = RAIN_COLOURS[k < 3 ? 0 : 1];
      ctx.globalAlpha = RAIN_ALPHAS[k % 3];
      ctx.stroke();
    }
    ctx.strokeStyle = RAIN;
    for (let i = 0; i < splashes.length; i++) {
      const p = splashes[i];
      const k = p.t / p.life;
      const s = 0.5 + 0.6 * k;
      ctx.globalAlpha = 0.4 * (1 - k * k);
      ctx.beginPath();
      ctx.moveTo(p.x - 6 * s, H - 1);
      ctx.quadraticCurveTo(p.x, H - 1 - 8 * s, p.x + 6 * s, H - 1);
      ctx.stroke();
    }
  }

  // ---- lightning: a flat zig-zag bolt, and a quick double flash of the
  // whole screen (drawn after the quiet pass, so it covers the words too)

  const bolt = new Float32Array(2 * 40); // x, y for each point: the bolt, then its fork
  let boltEnd = 0;
  let forkEnd = 0;

  function strikeBolt() {
    strike = 0;
    let n = 0;
    let x = rand(0.15, 0.85) * W;
    let y = -10;
    const end = rand(0.32, 0.55) * H;
    let dir = chance(0.5) ? 1 : -1;
    for (;;) {
      bolt[n * 2] = x;
      bolt[n * 2 + 1] = y;
      n += 1;
      if (y >= end || n >= 28) break;
      y = Math.min(end, y + rand(24, 46));
      if (chance(0.75)) dir = -dir;
      x = clamp(x + dir * rand(12, 30), 12, W - 12);
    }
    boltEnd = n;
    // Sometimes a short fork off the middle
    if (n > 4 && chance(0.6)) {
      const from = Math.floor(n * rand(0.3, 0.6));
      let fx = bolt[from * 2];
      let fy = bolt[from * 2 + 1];
      const away = bolt[(from + 1) * 2] > fx ? -1 : 1;
      const steps = Math.round(rand(2, 4));
      for (let i = 0; i <= steps; i++) {
        bolt[n * 2] = fx;
        bolt[n * 2 + 1] = fy;
        n += 1;
        fx += away * rand(10, 22);
        fy += rand(14, 26);
      }
    }
    forkEnd = n;
  }

  // One ribbon down the points from a to b, tapering to a point
  function ribbon(a, b, width) {
    const m = b - a - 1;
    if (m < 1) return;
    for (let i = 0; i <= m; i++) {
      const w = 0.4 + width * (1 - i / m);
      if (i === 0) ctx.moveTo(bolt[a * 2] - w, bolt[a * 2 + 1]);
      else ctx.lineTo(bolt[(a + i) * 2] - w, bolt[(a + i) * 2 + 1]);
    }
    for (let i = m; i >= 0; i--) ctx.lineTo(bolt[(a + i) * 2] + 0.4 + width * (1 - i / m), bolt[(a + i) * 2 + 1]);
    ctx.closePath();
  }

  function drawBolt() {
    ctx.beginPath();
    ribbon(0, boltEnd, 4.2);
    if (forkEnd > boltEnd) ribbon(boltEnd, forkEnd, 2);
    ctx.fillStyle = WHITE;
    ctx.globalAlpha = 0.95;
    ctx.fill();
  }

  const boltShown = (s) => s < 0.06 || (s >= 0.11 && s < 0.22);
  const flashAlpha = (s) => (s < 0.06 ? 0.3 : s < 0.11 ? 0 : s < 0.17 ? 0.2 : s < 0.4 ? (0.1 * (0.4 - s)) / 0.23 : 0);

  // ---- embers: round dots rising and wobbling, about a third with a faint
  // halo. They shrink away at the end instead of fading.

  const EMBER_COLOURS = [YELLOW, ORANGE, RED];

  function addEmber() {
    const p = add(embers);
    if (!p) return;
    p.x = rand(-8, W + 8);
    p.y = H + rand(4, 16);
    p.vx = rand(-10, 10);
    p.vy = -rand(80, 190);
    p.life = rand(3.5, 6.5);
    p.r = 1.5 + Math.random() ** 1.3 * 2.5;
    const u = Math.random();
    p.c = u < 0.25 ? 0 : u < 0.75 ? 1 : 2;
    p.h = chance(0.35) ? 1 : 0;
    p.a = rand(3, 11); // wobble: how far, and how fast
    p.b = rand(1.2, 2.8);
    p.ph = rand(0, TAU);
  }

  function drawEmbers() {
    for (let pass = 0; pass < 2; pass++) { // halos first, then the embers
      for (let c = 0; c < 3; c++) {
        let n = 0;
        ctx.beginPath();
        for (let i = 0; i < embers.length; i++) {
          const p = embers[i];
          if (p.c !== c || (pass === 0 && !p.h)) continue;
          const end = (p.life - p.t) / (0.25 * p.life);
          const r = (end < 1 ? p.r * end : p.r) * (pass === 0 ? 2.6 : 1);
          if (r < 0.3) continue;
          ctx.moveTo(p.x + r, p.y);
          ctx.arc(p.x, p.y, r, 0, TAU);
          n += 1;
        }
        if (!n) continue;
        ctx.fillStyle = EMBER_COLOURS[c];
        ctx.globalAlpha = pass === 0 ? 0.16 : 1;
        ctx.fill();
      }
    }
  }

  // ---- smoke: one flat silhouette. Every circle goes into a single path,
  // which is filled once at low opacity: the same as drawing them all
  // opaque on a separate canvas and laying that down faintly, but without
  // the extra canvas. Where puffs overlap they don't darken. A low bank of
  // cloud sits along the bottom; small clouds rise from it, grow, and
  // shrink away.

  let bank = [];

  function buildBank() {
    bank = [];
    for (let x = -10; x < W + 60; x += 54) {
      bank.push({ x: x + rand(-6, 6), y: bank.length % 2 ? rand(34, 44) : rand(12, 20), r: rand(48, 60), ph: rand(0, TAU) });
    }
  }

  function addPuff() {
    const p = add(puffs);
    if (!p) return null;
    p.x = rand(-20, W + 20);
    p.y = H - rand(40, 80);
    p.vx = rand(2, 10);
    p.vy = -rand(18, 32);
    p.life = rand(7, 10);
    p.a = rand(7, 11); // radius at the start
    p.b = rand(18, 30); // and when grown
    p.c = chance(0.5) ? 1 : -1; // which side the bigger lobe is on
    return p;
  }

  function movePuff(p, dt) {
    p.t += dt;
    p.x += p.vx * dt;
    p.vy *= 1 - 0.05 * dt;
    p.y += p.vy * dt;
    if (p.t >= p.life) p.dead = true;
  }

  // Smoke that's already been rising for a while, so a scene starts full
  function warmPuffs() {
    const n = Math.round(want.puffs * 7.5);
    for (let i = 0; i < n; i++) {
      const p = addPuff();
      if (!p) return;
      const age = rand(0, p.life * 0.9);
      while (p.t < age) movePuff(p, 0.25);
    }
  }

  function drawSmoke() {
    ctx.beginPath();
    if (smokeLevel > 0) {
      const base = H + (1 - smokeLevel) * 110; // the bank rises in, and sinks away
      ctx.rect(-20, base - 24, W + 40, 44);
      for (let i = 0; i < bank.length; i++) {
        const b = bank[i];
        const r = b.r + 2.5 * Math.sin(clock * 0.5 + b.ph);
        const y = base - b.y + 3 * Math.sin(clock * 0.37 + b.ph * 2);
        ctx.moveTo(b.x + r, y);
        ctx.arc(b.x, y, r, 0, TAU);
      }
    }
    // Each puff is a little cloud of three circles
    for (let i = 0; i < puffs.length; i++) {
      const p = puffs[i];
      const k = p.t / p.life;
      const grow = 1 - (1 - Math.min(1, k / 0.6)) ** 2;
      const shrink = k < 0.7 ? 1 : (1 - k) / 0.3;
      const r = (p.a + (p.b - p.a) * grow) * shrink * smokeLevel;
      if (r < 0.5) continue;
      const s = p.c;
      ctx.moveTo(p.x + r, p.y);
      ctx.arc(p.x, p.y, r, 0, TAU);
      ctx.moveTo(p.x + s * r * 0.8 + r * 0.68, p.y + r * 0.3);
      ctx.arc(p.x + s * r * 0.8, p.y + r * 0.3, r * 0.68, 0, TAU);
      ctx.moveTo(p.x - s * r * 0.72 + r * 0.54, p.y + r * 0.4);
      ctx.arc(p.x - s * r * 0.72, p.y + r * 0.4, r * 0.54, 0, TAU);
    }
    ctx.fillStyle = GREY;
    ctx.globalAlpha = 0.13;
    ctx.fill();
  }

  // ---- flames: a line of flat flame tongues along the bottom, like the
  // campfire icon repeated, in three layers: red at the back, then orange,
  // then yellow. Each tongue's height sways on two offset sine waves.

  const FLAME_LAYERS = [
    { colour: RED, gap: 46, width: 60, lo: 0.62, hi: 1, base: 0.34 },
    { colour: ORANGE, gap: 42, width: 50, lo: 0.42, hi: 0.72, base: 0.22 },
    { colour: YELLOW, gap: 38, width: 38, lo: 0.2, hi: 0.44, base: 0.1 },
  ];
  let tongues = [];

  function buildFlames() {
    tongues = FLAME_LAYERS.map((L, n) => {
      const list = [];
      for (let x = -L.gap + n * L.gap * 0.37; x < W + L.gap; x += L.gap) {
        list.push({
          x: x + rand(-0.15, 0.15) * L.gap, w: L.width * rand(0.85, 1.15),
          lo: L.lo * rand(0.9, 1.1), hi: L.hi * rand(0.9, 1.05),
          f1: rand(2.2, 3.6), f2: rand(4.6, 7), f3: rand(1.3, 2.4), p1: rand(0, TAU), p2: rand(0, TAU), p3: rand(0, TAU),
        });
      }
      return list;
    });
  }

  function drawFlames() {
    const rise = flameLevel * flameLevel * (3 - 2 * flameLevel);
    const band = clamp(H * 0.14, 60, 150) * rise;
    for (let n = 0; n < FLAME_LAYERS.length; n++) {
      const L = FLAME_LAYERS[n];
      const list = tongues[n];
      const base = L.base * band;
      ctx.beginPath();
      ctx.rect(-10, H - base, W + 20, base + 10);
      for (let i = 0; i < list.length; i++) {
        const T = list[i];
        const h = band * (T.lo + (T.hi - T.lo) * (0.5 + 0.3 * Math.sin(T.f1 * clock + T.p1) + 0.2 * Math.sin(T.f2 * clock + T.p2)));
        const hw = T.w / 2;
        const tx = T.x + T.w * 0.16 * Math.sin(T.f3 * clock + T.p3);
        const ty = H - h;
        ctx.moveTo(T.x - hw, H + 4);
        ctx.lineTo(T.x - hw, H - h * 0.18);
        ctx.bezierCurveTo(T.x - hw, H - h * 0.56, tx - hw * 0.18, ty + h * 0.3, tx, ty);
        ctx.bezierCurveTo(tx + hw * 0.18, ty + h * 0.3, T.x + hw, H - h * 0.56, T.x + hw, H - h * 0.18);
        ctx.lineTo(T.x + hw, H + 4);
        ctx.closePath();
      }
      ctx.fillStyle = L.colour;
      ctx.globalAlpha = 1;
      ctx.fill();
    }
  }

  // ---- sparks: bursts of short bright streaks, white-hot to yellow to
  // orange, that fly out and fall. They burst in the side margins or above
  // the card, away from the words.

  const SPARK_COLOURS = [WHITE, YELLOW, ORANGE];

  function nearWords(x, y, pad) {
    for (let i = 0; i < quiet.length; i++) {
      const r = quiet[i];
      if (x > r.left - ox - pad && x < r.right - ox + pad && y > r.top - oy - pad && y < r.bottom - oy + pad) return true;
    }
    return false;
  }

  function burst() {
    let x = 0;
    let y = 0;
    for (let tries = 0; tries < 8; tries++) {
      if (chance(0.6)) {
        x = (chance(0.5) ? rand(0.03, 0.13) : rand(0.87, 0.97)) * W;
        y = rand(0.3, 0.8) * H;
      } else {
        x = rand(0.12, 0.88) * W;
        y = rand(0.13, 0.3) * H;
      }
      if (!nearWords(x, y, 36)) break;
    }
    // A white pop where it strikes, then the sparks
    const pop = add(sparks);
    if (!pop) return;
    pop.x = x;
    pop.y = y;
    pop.life = 0.14;
    pop.h = 1;
    const n = Math.round(rand(14, 22));
    for (let i = 0; i < n; i++) {
      const p = add(sparks);
      if (!p) return;
      const a = rand(0, TAU);
      const s = rand(90, 260);
      p.x = x;
      p.y = y;
      p.vx = Math.cos(a) * s;
      p.vy = Math.sin(a) * s - 80;
      p.life = rand(0.4, 0.9);
      p.h = 0;
    }
  }

  function drawSparks() {
    let pops = 0;
    ctx.beginPath();
    for (let i = 0; i < sparks.length; i++) {
      const p = sparks[i];
      if (!p.h) continue;
      const r = 1 + 6 * (1 - p.t / p.life);
      ctx.moveTo(p.x + r, p.y);
      ctx.arc(p.x, p.y, r, 0, TAU);
      pops += 1;
    }
    if (pops) {
      ctx.fillStyle = WHITE;
      ctx.globalAlpha = 0.85;
      ctx.fill();
    }
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for (let c = 0; c < 3; c++) {
      let n = 0;
      ctx.beginPath();
      for (let i = 0; i < sparks.length; i++) {
        const p = sparks[i];
        const k = p.t / p.life;
        if (p.h || (k < 0.28 ? 0 : k < 0.62 ? 1 : 2) !== c) continue;
        ctx.moveTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05);
        ctx.lineTo(p.x, p.y);
        n += 1;
      }
      if (!n) continue;
      ctx.strokeStyle = SPARK_COLOURS[c];
      ctx.globalAlpha = 1;
      ctx.stroke();
    }
  }

  // ---- dust: small round motes drifting sideways and a little upward,
  // thickest near the ground, with a few big faint ones for depth

  const DUST_COLOURS = [OCHRE, BROWN];
  const DUST_ALPHAS = [0.4, 0.6, 0.8, 0.14]; // the last is for the big faint motes

  function newMote(p, x) {
    const big = chance(0.12);
    p.x = x;
    p.y = H * (0.3 + 0.7 * Math.random() ** 0.4);
    p.vx = rand(30, 90);
    p.vy = -rand(0, 10);
    p.r = big ? rand(4, 7) : 1.3 + Math.random() ** 2 * 1.9;
    p.c = (chance(0.5) ? 4 : 0) + (big ? 3 : Math.floor(Math.random() * 3)); // colour and brightness
    p.a = rand(3, 8); // bob: how far, and how fast
    p.b = rand(0.8, 1.8);
    p.ph = rand(0, TAU);
  }

  function drawDust() {
    for (let k = 0; k < 8; k++) {
      let n = 0;
      ctx.beginPath();
      for (let i = 0; i < motes.length; i++) {
        const p = motes[i];
        if (p.c !== k) continue;
        ctx.moveTo(p.x + p.r, p.y);
        ctx.arc(p.x, p.y, p.r, 0, TAU);
        n += 1;
      }
      if (!n) continue;
      ctx.fillStyle = DUST_COLOURS[k >> 2];
      ctx.globalAlpha = DUST_ALPHAS[k & 3];
      ctx.fill();
    }
  }

  // ---- stars: small dots and a few four-point twinkles, in the top of the
  // sky. Positions are kept as fractions of the screen, so they hold still
  // when the browser's toolbar comes and goes.

  let stars = [];
  let starSteps = new Uint8Array(0); // each dot's brightness step, this frame

  function buildStars() {
    const count = Math.round(clamp((95 * W * H) / REF_AREA, 40, 140));
    if (stars.length && Math.abs(stars.length - count) < count * 0.25) return;
    stars = [];
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      stars.push({ u: Math.random(), v: Math.random() * 0.72, r: u < 0.5 ? 1 : u < 0.85 ? 1.35 : 1.8, a: rand(0.45, 0.95), w: rand(0.6, 2.2), ph: rand(0, TAU), big: false, c: WHITE });
    }
    // The twinkles go where they'll be seen: high up, or down the sides of
    // the card
    const bigs = Math.round(clamp((7 * W) / 390, 4, 12));
    for (let i = 0; i < bigs; i++) {
      const high = i % 3 !== 2;
      const u = high ? rand(0.04, 0.96) : chance(0.5) ? rand(0.03, 0.1) : rand(0.9, 0.97);
      stars.push({ u, v: high ? rand(0.03, 0.3) : rand(0.3, 0.62), r: rand(5, 8), a: 0.95, w: rand(0.7, 1.6), ph: rand(0, TAU), big: true, c: chance(0.3) ? YELLOW : WHITE });
    }
    starSteps = new Uint8Array(stars.length);
  }

  function drawStars() {
    // Dots, batched by brightness in eight flat steps
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      starSteps[i] = s.big ? 0 : Math.round(8 * s.a * starLevel * (0.7 + 0.3 * Math.sin(s.w * clock + s.ph)));
    }
    ctx.fillStyle = WHITE;
    for (let q = 1; q <= 8; q++) {
      let n = 0;
      ctx.beginPath();
      for (let i = 0; i < stars.length; i++) {
        if (starSteps[i] !== q) continue;
        const s = stars[i];
        const x = s.u * W;
        const y = s.v * H;
        ctx.moveTo(x + s.r, y);
        ctx.arc(x, y, s.r, 0, TAU);
        n += 1;
      }
      if (!n) continue;
      ctx.globalAlpha = q / 8;
      ctx.fill();
    }
    // Twinkles: a flat four-point star that swells and shrinks
    for (let pass = 0; pass < 2; pass++) {
      const colour = pass ? YELLOW : WHITE;
      ctx.beginPath();
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        if (!s.big || s.c !== colour) continue;
        const r = s.r * (0.55 + 0.45 * (0.5 + 0.5 * Math.sin(s.w * clock + s.ph)));
        const x = s.u * W;
        const y = s.v * H;
        const q = r * 0.16;
        ctx.moveTo(x, y - r);
        ctx.quadraticCurveTo(x + q, y - q, x + r, y);
        ctx.quadraticCurveTo(x + q, y + q, x, y + r);
        ctx.quadraticCurveTo(x - q, y + q, x - r, y);
        ctx.quadraticCurveTo(x - q, y - q, x, y - r);
        ctx.closePath();
      }
      ctx.fillStyle = colour;
      ctx.globalAlpha = 0.95 * starLevel;
      ctx.fill();
    }
  }

  // ---- fireflies: yellow dots that wander and blink, with a soft halo in
  // two flat steps

  function addFly() {
    const p = add(flies);
    if (!p) return;
    p.x = rand(0, W);
    p.y = rand(0.32, 0.95) * H;
    p.a = rand(0, TAU); // heading
    p.vx = rand(10, 22); // speed
    p.b = rand(2.2, 3.6); // seconds from one blink to the next
    p.ph = rand(0, p.b);
  }

  // How lit a firefly is, 0 to 1: it lights up, holds, and fades, then
  // rests dim until the next blink
  function glow(p) {
    const u = ((p.t + p.ph) % p.b) / p.b;
    if (u >= 0.65) return 0;
    const g = Math.min(1, u / 0.15, (0.65 - u) / 0.2);
    return g * g * (3 - 2 * g);
  }

  function drawFlies() {
    ctx.fillStyle = YELLOW;
    for (let i = 0; i < flies.length; i++) {
      const p = flies[i];
      const g = glow(p);
      if (g > 0.02) {
        ctx.globalAlpha = 0.13 * g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7.5 + 1.5 * g, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 0.3 * g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.6, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 0.25 + 0.75 * g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2 + 0.5 * g, 0, TAU);
      ctx.fill();
    }
  }

  // ---- grain: kernels (small ellipses) falling and tumbling

  const GRAIN_COLOURS = [YELLOW, OCHRE];

  function newGrain(p, y) {
    p.x = rand(0, W);
    p.y = y;
    p.vy = rand(32, 62);
    p.a = rand(5, 13); // sway: how far, and how fast
    p.b = rand(0.7, 1.5);
    p.ph = rand(0, TAU);
    p.r = rand(1.6, 2.2); // half the kernel's width
    p.h = p.r * rand(1.8, 2.1); // and half its length
    p.vx = (chance(0.5) ? 1 : -1) * rand(1.5, 4); // tumble, in radians a second
    p.c = chance(0.5) ? 0 : 1;
  }

  function drawGrain() {
    for (let c = 0; c < 2; c++) {
      let n = 0;
      ctx.beginPath();
      for (let i = 0; i < grains.length; i++) {
        const p = grains[i];
        if (p.c !== c) continue;
        const turn = p.ph + p.vx * p.t;
        ctx.moveTo(p.x + p.r * Math.cos(turn), p.y + p.r * Math.sin(turn));
        ctx.ellipse(p.x, p.y, p.r, p.h, turn, 0, TAU);
        n += 1;
      }
      if (!n) continue;
      ctx.fillStyle = GRAIN_COLOURS[c];
      ctx.globalAlpha = 0.9;
      ctx.fill();
    }
  }

  // ---- birds: flat "v" silhouettes flapping across the top of the sky,
  // a few at a time

  // A height to fly at, in the top of the sky and clear of the words when
  // there's room
  function flightLine() {
    let y = 0;
    for (let tries = 0; tries < 12; tries++) {
      y = rand(0.1, 0.22) * H;
      let clear = true;
      for (let i = 0; i < quiet.length && clear; i++) {
        const r = quiet[i];
        if (y + 30 > r.top - oy - 8 && y - 16 < r.bottom - oy + 8) clear = false;
      }
      if (clear) break;
    }
    return y;
  }

  function flock(x0) {
    const dir = birdWay;
    const y0 = flightLine();
    const n = Math.round(rand(3, 5));
    const speed = rand(58, 82);
    const start = x0 ?? (dir > 0 ? -20 : W + 20);
    for (let i = 0; i < n; i++) {
      const p = add(birds);
      if (!p) return;
      p.x = start - dir * i * rand(20, 32);
      p.y = y0 + rand(-6, 6) + i * rand(-1, 3);
      p.vx = dir * speed * rand(0.95, 1.05);
      p.r = rand(9, 13); // half the wingspan
      p.b = rand(12, 16); // wingbeats, in radians a second
      p.ph = rand(0, TAU);
      p.a = rand(0, TAU);
    }
  }

  function drawBirds() {
    ctx.beginPath();
    for (let i = 0; i < birds.length; i++) {
      const p = birds[i];
      const s = p.r;
      const x = p.x;
      const y = p.y + 2.5 * Math.sin(1.3 * p.t + p.a);
      const lift = s * (0.15 + 0.5 * Math.sin(p.b * p.t + p.ph)); // wingtips above the body
      const cy = y - lift * 0.9;
      ctx.moveTo(x - s, y - lift);
      ctx.quadraticCurveTo(x - s * 0.4, cy - 1.8, x, y - 1.2);
      ctx.quadraticCurveTo(x + s * 0.4, cy - 1.8, x + s, y - lift);
      ctx.quadraticCurveTo(x + s * 0.4, cy + 1.4, x, y + 2);
      ctx.quadraticCurveTo(x - s * 0.4, cy + 1.4, x - s, y - lift);
      ctx.closePath();
    }
    ctx.fillStyle = CREAM;
    ctx.globalAlpha = 0.85;
    ctx.fill();
  }

  // ---- the simulation

  function spawn(dt) {
    if (on.rain) for (let n = drops.length; n < want.rain; n++) { const p = add(drops); if (!p) break; newDrop(p, rand(-40, H)); }
    if (on.embers) {
      emberDue += want.embers * dt;
      for (; emberDue >= 1; emberDue -= 1) addEmber();
    }
    if (on.smoke) {
      puffDue += want.puffs * dt;
      for (; puffDue >= 1; puffDue -= 1) addPuff();
    }
    if (on.sparks && clock >= nextSparks) { nextSparks = clock + rand(0.35, 0.9); burst(); }
    if (on.dust) for (let n = motes.length; n < want.dust; n++) { const p = add(motes); if (!p) break; newMote(p, rand(-8, W)); }
    if (on.fireflies) for (let n = flies.length; n < want.flies; n++) addFly();
    if (on.grain) for (let n = grains.length; n < want.grain; n++) { const p = add(grains); if (!p) break; newGrain(p, rand(-0.1 * H, H)); }
    if (on.birds && clock >= nextBirds) { nextBirds = clock + rand(6, 11); flock(); }
    if (on.lightning && !still && clock >= nextBolt) { nextBolt = clock + rand(2.5, 6); strikeBolt(); }
    if (on.shake && !still && clock >= nextShake) { nextShake = clock + rand(4, 7.5); onShake(); }
  }

  function update(dt) {
    for (let i = 0; i < drops.length; i++) {
      const p = drops[i];
      p.y += p.vy * dt;
      p.x -= p.vy * SLANT * dt;
      if (p.x < -20) p.x += W + 40;
      if (p.y > H + 2) {
        if (!still && chance(0.3)) splash(p.x);
        if (on.rain && drops.length <= want.rain) newDrop(p, p.y - H - rand(20, 60));
        else p.dead = true;
      }
    }
    for (let i = 0; i < splashes.length; i++) {
      const p = splashes[i];
      p.t += dt;
      if (p.t >= p.life) p.dead = true;
    }
    for (let i = 0; i < embers.length; i++) {
      const p = embers[i];
      p.t += dt;
      p.x += (p.vx + p.a * p.b * Math.cos(p.b * p.t + p.ph)) * dt;
      p.vy *= 1 - 0.08 * dt;
      p.y += p.vy * dt;
      if (p.t >= p.life || p.y < -12) p.dead = true;
    }
    for (let i = 0; i < puffs.length; i++) {
      const p = puffs[i];
      movePuff(p, dt);
      if (!on.smoke && smokeLevel <= 0) p.dead = true;
    }
    for (let i = 0; i < sparks.length; i++) {
      const p = sparks[i];
      p.t += dt;
      if (p.t >= p.life) p.dead = true;
      if (p.h) continue; // a pop stays put
      const drag = 1 - 1.3 * dt;
      p.vx *= drag;
      p.vy = p.vy * drag + 320 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    for (let i = 0; i < motes.length; i++) {
      const p = motes[i];
      p.t += dt;
      p.x += p.vx * dt;
      p.y += (p.vy + p.a * p.b * Math.cos(p.b * p.t + p.ph)) * dt;
      if (p.x > W + 8) {
        if (on.dust && motes.length <= want.dust) newMote(p, -8);
        else p.dead = true;
      }
    }
    for (let i = 0; i < flies.length; i++) {
      const p = flies[i];
      p.t += dt;
      p.a += rand(-6, 6) * dt;
      p.x += Math.cos(p.a) * p.vx * dt;
      p.y += Math.sin(p.a) * p.vx * dt;
      if (p.x < -10) p.x += W + 20;
      else if (p.x > W + 10) p.x -= W + 20;
      if (p.y < H * 0.3) { p.y = H * 0.3; p.a = -p.a; } else if (p.y > H * 0.96) { p.y = H * 0.96; p.a = -p.a; }
      if (!on.fireflies && glow(p) < 0.02) p.dead = true;
    }
    for (let i = 0; i < grains.length; i++) {
      const p = grains[i];
      p.t += dt;
      p.y += p.vy * dt;
      p.x += p.a * p.b * Math.cos(p.b * p.t + p.ph) * dt;
      if (p.y > H + 8) {
        if (on.grain && grains.length <= want.grain) newGrain(p, -8);
        else p.dead = true;
      }
    }
    for (let i = 0; i < birds.length; i++) {
      const p = birds[i];
      p.t += dt;
      p.x += p.vx * dt;
      if (p.vx > 0 ? p.x > W + 24 : p.x < -24) p.dead = true;
    }
    for (let i = 0; i < lists.length; i++) sweep(lists[i]);
    if (strike >= 0) { strike += dt; if (strike > 0.4) strike = -1; }
    flameLevel = approach(flameLevel, on.flames ? 1 : 0, dt / 0.8);
    starLevel = approach(starLevel, on.stars ? 1 : 0, dt / 0.8);
    smokeLevel = approach(smokeLevel, on.smoke ? 1 : 0, dt / 1.2);
  }

  function sim(dt) {
    clock += dt;
    spawn(dt);
    update(dt);
  }

  // ---- drawing, back to front

  function draw() {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, W, H);
    if (starLevel > 0) drawStars();
    if (smokeLevel > 0 || puffs.length) drawSmoke();
    if (birds.length) drawBirds();
    if (motes.length) drawDust();
    if (grains.length) drawGrain();
    if (drops.length || splashes.length) drawRain();
    if (flies.length) drawFlies();
    if (embers.length) drawEmbers();
    if (sparks.length) drawSparks();
    if (flameLevel > 0) drawFlames();
    if (strike >= 0 && boltShown(strike)) drawBolt();
    drawQuiet();
    if (strike >= 0 && flashAlpha(strike) > 0) {
      ctx.globalAlpha = flashAlpha(strike);
      ctx.fillStyle = WHITE;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.globalAlpha = 1;
  }

  function roundedBox(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Weather thins out behind text, so rain and embers never cross the
  // words: each quiet box rubs out most of what's under it, with a soft
  // two-step edge. Overlapping boxes share one path, so they don't add up.
  function drawQuiet() {
    if (!quiet.length) return;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000';
    for (let step = 0; step < 2; step++) {
      const pad = step ? 0 : 8;
      ctx.beginPath();
      for (let i = 0; i < quiet.length; i++) {
        const r = quiet[i];
        roundedBox(r.left - ox - pad, r.top - oy - pad, r.right - r.left + pad * 2, r.bottom - r.top + pad * 2, 12 + pad);
      }
      ctx.globalAlpha = step ? 0.65 : 0.45; // about 80% gone in the middle
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  // ---- the loop

  // Anything on screen, or about to be? (Sparks, birds, lightning and
  // shakes come and go on a timer; between them there may be nothing.)
  function busy() {
    return live > 0 || strike >= 0 || flameLevel > 0 || starLevel > 0 || smokeLevel > 0
      || on.rain || on.embers || on.smoke || on.flames || on.dust || on.stars || on.fireflies || on.grain;
  }

  function tick(now) {
    timer = 0;
    if (paused || !enabled || still) return;
    if (!last) last = now - FRAME_MS;
    const elapsed = now - last;
    if (elapsed >= FRAME_MS - 5) {
      last = now;
      // Catch up on time, not frames, so weather moves at the same speed on
      // a phone in low-power mode (or a throttled tab). A long gap, like a
      // stall, is dropped rather than replayed.
      let left = Math.min(elapsed / 1000, CATCH_UP);
      while (left > 0.0005) {
        const dt = Math.min(left, MAX_STEP);
        sim(dt);
        left -= dt;
      }
      draw();
      if (!busy()) { sleep(); return; }
    }
    timer = requestAnimationFrame(tick);
  }

  // Nothing to draw: stop, and wake up only for the next timed event
  function sleep() {
    last = 0;
    let due = Infinity;
    if (on.sparks) due = Math.min(due, nextSparks);
    if (on.birds) due = Math.min(due, nextBirds);
    if (on.lightning) due = Math.min(due, nextBolt);
    if (on.shake) due = Math.min(due, nextShake);
    if (due === Infinity) return;
    sleptAt = performance.now();
    nap = setTimeout(wake, Math.max(0, (due - clock) * 1000 - FRAME_MS));
  }

  function wake() {
    nap = 0;
    clock += (performance.now() - sleptAt) / 1000;
    start();
  }

  function start() {
    if (paused || !enabled || still || timer) return;
    if (nap) {
      clearTimeout(nap);
      nap = 0;
      clock += (performance.now() - sleptAt) / 1000;
    }
    timer = requestAnimationFrame(tick);
  }

  function stop() {
    if (timer) cancelAnimationFrame(timer);
    if (nap) {
      clearTimeout(nap);
      clock += (performance.now() - sleptAt) / 1000;
    }
    timer = 0;
    nap = 0;
    last = 0;
  }

  // Reduced motion: settle the weather for a moment, then draw one still frame
  function drawStill() {
    clearAll();
    flameLevel = on.flames ? 1 : 0;
    starLevel = on.stars ? 1 : 0;
    smokeLevel = on.smoke ? 1 : 0;
    emberDue = 0;
    puffDue = 0;
    nextBirds = clock + SETTLE + 1;
    nextSparks = clock + SETTLE - 0.25;
    if (on.smoke) warmPuffs();
    for (let i = 0; i < SETTLE * FPS; i++) sim(1 / FPS);
    if (on.birds) flock(rand(0.4, 0.75) * W);
    draw();
  }

  // ---- the API

  function set(names, opts = {}) {
    enabled = opts.enabled !== false;
    still = !!opts.reduceMotion;
    const added = EFFECT_NAMES.filter((n) => names.includes(n) && !on[n]);
    for (const n of EFFECT_NAMES) on[n] = names.includes(n);
    if (!enabled) {
      stop();
      clearAll();
      flameLevel = 0;
      starLevel = 0;
      smokeLevel = 0;
      ctx.clearRect(0, 0, W, H);
      return;
    }
    if (added.includes('shake') && !still) { nextShake = clock + rand(4, 7.5); onShake(); }
    if (added.includes('lightning')) nextBolt = clock + rand(0.5, 2);
    if (added.includes('sparks')) nextSparks = clock + rand(0.1, 0.4);
    if (added.includes('birds')) { nextBirds = clock + rand(0.3, 1.5); birdWay = chance(0.5) ? 1 : -1; }
    if (still) { stop(); drawStill(); return; }
    // Smoke is slow to build, so it starts part-way; the new puffs grow in
    // with the bank
    if (on.smoke && smokeLevel === 0 && !puffs.length) warmPuffs();
    start();
  }

  function setPaused(value) {
    paused = value;
    if (paused) stop();
    else start();
  }

  function place() {
    const box = canvas.getBoundingClientRect();
    ox = box.left;
    oy = box.top;
    return box;
  }

  function resize() {
    const box = place();
    const oldW = W;
    W = box.width || window.innerWidth;
    H = box.height || window.innerHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cw = Math.max(1, Math.round(W * dpr));
    const ch = Math.max(1, Math.round(H * dpr));
    if (canvas.width !== cw) canvas.width = cw;
    if (canvas.height !== ch) canvas.height = ch;
    ctx.setTransform(cw / W, 0, 0, ch / H, 0, 0);
    const area = (W * H) / REF_AREA;
    want.rain = Math.round(clamp(105 * area, 40, 160));
    want.dust = Math.round(clamp(85 * area, 30, 120));
    want.grain = Math.round(clamp(42 * area, 16, 80));
    want.flies = Math.round(clamp(14 * area, 8, 20));
    want.embers = clamp((16 * W) / 390, 8, 36); // a second
    want.puffs = clamp((1.5 * W) / 390, 1, 4); // a second
    buildStars();
    // The flame line and cloud bank depend only on the width, so the phone's
    // toolbar coming and going doesn't reshuffle them
    if (W !== oldW || !tongues.length) { buildFlames(); buildBank(); }
    // Resizing clears the canvas, so draw straight away rather than show a
    // blank frame. A still frame settles again only if the width changed.
    if (!enabled) return;
    if (still && W !== oldW) drawStill();
    else draw();
  }

  // Boxes (in CSS pixels, like getBoundingClientRect) where text sits
  function setQuiet(rects) {
    quiet = rects.filter((r) => r && r.right > r.left && r.bottom > r.top);
    place();
    if (still && enabled) draw();
  }

  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => setPaused(document.hidden));
  return { set, setPaused, resize, setQuiet };
}
