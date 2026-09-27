// The page turn: a soft leaf lifted from its bottom-right corner, drawn as
// a flat fold. The corner C = (W, H) is carried to a point P; the crease is
// the perpendicular bisector of C and P. The part of the page on C's side is
// lifted: the page on top is clipped to the part that stays down, and the
// back of the leaf (plain ruled paper) is that lifted part mirrored across
// the crease. Two shadows follow the crease: one cast by the curl on the page
// beneath, one shading the back of the leaf where it bends.
//
// P moves from the corner, up and over, to (-W, H): the corner's mirror
// across the spine, where the whole leaf has turned. A small P near the
// corner is the dog-ear that invites a turn; it's the same geometry, so a tap
// or a drag carries straight on from it.

export function createTurn(book) {
  const make = (cls, parent = book) => {
    const el = document.createElement('div');
    el.className = cls;
    parent.append(el);
    return el;
  };
  const cast = make('turn-cast');
  const castBand = make('band', cast);
  const flapWrap = make('flap-wrap');
  const flap = make('flap', flapWrap);
  make('flap-paper', flap);
  const shade = make('flap-shade', flap);
  cast.hidden = true;
  flapWrap.hidden = true;

  let W = 1;
  let H = 1;
  let top = null;
  let P = null;

  const poly = (pts) => (pts.length < 3 ? 'polygon(0 0, 0 0, 0 0)' : `polygon(${pts.map((p) => `${p.x.toFixed(2)}px ${p.y.toFixed(2)}px`).join(', ')})`);

  // Clip a polygon to the half-plane where fn(X) >= 0 (Sutherland–Hodgman)
  function clip(pts, fn) {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const fa = fn(a);
      const fb = fn(b);
      if (fa >= 0) out.push(a);
      if ((fa >= 0) !== (fb >= 0)) {
        const t = fa / (fa - fb);
        out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      }
    }
    return out;
  }

  function draw() {
    if (!top) return;
    const C = { x: W, y: H };
    const dx = P ? P.x - C.x : 0;
    const dy = P ? P.y - C.y : 0;
    const len = Math.hypot(dx, dy);
    if (!P || len < 0.75) {
      top.style.clipPath = '';
      cast.hidden = true;
      flapWrap.hidden = true;
      return;
    }
    cast.hidden = false;
    flapWrap.hidden = false;
    const n = { x: dx / len, y: dy / len }; // unit normal, from C toward P
    const M = { x: (P.x + C.x) / 2, y: (P.y + C.y) / 2 }; // on the crease
    const k = n.x * M.x + n.y * M.y; // the crease: n·X = k
    const side = (X) => n.x * X.x + n.y * X.y - k; // >= 0 stays down
    const rect = [{ x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H }, { x: 0, y: H }];
    top.style.clipPath = poly(clip(rect, side));
    flap.style.clipPath = poly(clip(rect, (X) => -side(X)));
    // The mirror across the crease: X' = X - 2 (n·X - k) n
    const a = 1 - 2 * n.x * n.x;
    const b = -2 * n.x * n.y;
    const d = 1 - 2 * n.y * n.y;
    flap.style.transform = `matrix(${a}, ${b}, ${b}, ${d}, ${2 * k * n.x}, ${2 * k * n.y})`;

    // How far the leaf has turned, 0 to 1, and how strongly it shades
    const turned = Math.min(1, len / (2 * W));
    const lift = Math.sin(Math.PI * Math.min(1, turned * 1.05)) ** 0.7;
    // Both bands sit on the crease and run toward C (away from P). In the
    // flap's own coordinates that's the lifted part, before it's mirrored.
    const angle = Math.atan2(-n.y, -n.x);
    const band = `translate(${M.x}px, ${M.y}px) rotate(${angle}rad) translate(0, -50%)`;
    const depth = len / 2; // from the crease to the lifted corner
    castBand.style.transform = band;
    castBand.style.width = `${Math.max(60, depth * 1.4 + 40)}px`;
    cast.style.opacity = `${0.25 + 0.75 * lift}`;
    castBand.style.setProperty('--reach', `${Math.round(18 + 70 * lift)}px`);
    shade.style.transform = band;
    shade.style.width = `${Math.max(40, depth + 4)}px`;
    shade.style.setProperty('--curl', `${Math.round(10 + depth * 0.22)}px`);
    shade.style.opacity = `${0.55 + 0.45 * lift}`;
  }

  // Keep P where a real leaf could reach: the spine can't lift, so every
  // point of the spine stays within reach of the corner's travel
  function constrain(p) {
    let x = p.x;
    let y = Math.min(H, p.y);
    const bx = x;
    const by = y - H;
    const dB = Math.hypot(bx, by);
    if (dB > W) { x = (bx / dB) * W; y = H + (by / dB) * W; }
    const D = Math.hypot(W, H);
    const dT = Math.hypot(x, y);
    if (dT > D) { x = (x / dT) * D; y = (y / dT) * D; }
    return { x, y };
  }

  return {
    size(w, h) { W = w; H = h; draw(); },
    setTop(el) { if (top && top !== el) top.style.clipPath = ''; top = el; draw(); },
    set(p) { P = p ? constrain(p) : null; draw(); },
    get P() { return P; },
    get corner() { return { x: W, y: H }; },
    get end() { return { x: -W, y: H }; },
    constrain,
  };
}
