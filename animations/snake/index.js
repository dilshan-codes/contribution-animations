import { cells, svgWrap, CELL, GAP } from '../../core/grid.js';

const STEP = CELL + GAP;
const BODY_CELLS = 6;               // snake length in cells
const BODY_LEN = BODY_CELLS * STEP;
const CORNER = 4.5;                 // corner rounding radius
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const BODY = '#a371f7', SHINE = '#d8c4ff', HEAD = '#8957e5';

// Seeded random numbers: the same data always gives the same snake.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedFrom(items) {
  let s = 2166136261;
  for (const c of items) s = Math.imul(s ^ (c.count + 1), 16777619);
  return s >>> 0;
}

// Builds an SVG path with rounded corners and the distance along it at every point.
function smooth(pts, r) {
  const f = (n) => +n.toFixed(1);
  const unit = (a, b) => {
    const l = Math.hypot(b.x - a.x, b.y - a.y);
    return { x: (b.x - a.x) / l, y: (b.y - a.y) / l };
  };
  let d = `M${f(pts[0].x)} ${f(pts[0].y)}`;
  let cur = pts[0], len = 0;
  const dist = [0];
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i], next = pts[i + 1];
    const into = unit(pts[i - 1], p);
    const out = next ? unit(p, next) : into;
    if (next && (into.x !== out.x || into.y !== out.y)) {
      const a = { x: p.x - into.x * r, y: p.y - into.y * r };
      const b = { x: p.x + out.x * r, y: p.y + out.y * r };
      len += Math.hypot(a.x - cur.x, a.y - cur.y);
      let q = 0, last = a;
      for (let s = 1; s <= 12; s++) {
        const t = s / 12, m = 1 - t;
        const pt = {
          x: m * m * a.x + 2 * m * t * p.x + t * t * b.x,
          y: m * m * a.y + 2 * m * t * p.y + t * t * b.y,
        };
        q += Math.hypot(pt.x - last.x, pt.y - last.y);
        last = pt;
      }
      dist.push(len + q / 2);
      len += q;
      cur = b;
      d += `L${f(a.x)} ${f(a.y)}Q${f(p.x)} ${f(p.y)} ${f(b.x)} ${f(b.y)}`;
    } else {
      dist.push(len + Math.hypot(p.x - cur.x, p.y - cur.y));
    }
  }
  const end = pts[pts.length - 1];
  len += Math.hypot(end.x - cur.x, end.y - cur.y);
  d += `L${f(end.x)} ${f(end.y)}`;
  dist[dist.length - 1] = len;
  return { d, dist, length: len };
}

export default function render(data, options = {}) {
  const { items, width, height } = cells(data);
  const rnd = rng(options.seed ?? seedFrom(items));
  const id = (c) => c.week * 7 + c.day;
  const at = new Map(items.map((c) => [id(c), c]));
  const find = (w, d) => (d < 0 || d > 6 ? undefined : at.get(w * 7 + d));
  const food = new Set(items.filter((c) => c.level > 0).map(id));
  const shuffled = (list) => {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // 1. Random walk: head for one of the 3 nearest cells with contributions, avoiding its own body.
  const starts = items.filter((c) => c.week === 0);
  const first = starts[Math.floor(rnd() * starts.length)] ?? items[0];
  const route = [];
  const visit = (c) => { route.push(c); food.delete(id(c)); };
  visit(first);

  for (let guard = 0; food.size && guard < 6000; guard++) {
    const cur = route[route.length - 1];
    const blocked = new Set(route.slice(-BODY_CELLS, -1).map(id));
    const parent = new Map([[id(cur), null]]);
    const order = [cur];
    for (let i = 0; i < order.length; i++) {
      const c = order[i];
      for (const [dx, dy] of shuffled(DIRS)) {
        const n = find(c.week + dx, c.day + dy);
        if (!n || parent.has(id(n)) || blocked.has(id(n))) continue;
        parent.set(id(n), c);
        order.push(n);
      }
    }
    const near = order.filter((c) => food.has(id(c))).slice(0, 3);
    if (near.length) {
      const leg = [];
      for (let c = near[Math.floor(rnd() * near.length)]; c !== cur; c = parent.get(id(c))) leg.push(c);
      leg.reverse().forEach(visit);
    } else {
      // boxed in by its own body: take any free step
      const back = route[route.length - 2];
      const opts = DIRS.map(([dx, dy]) => find(cur.week + dx, cur.day + dy)).filter((n) => n && n !== back);
      if (!opts.length) break;
      visit(opts[Math.floor(rnd() * opts.length)]);
    }
  }

  // 2. Path: enters from off-screen, visits the route, leaves off-screen.
  const mid = (c) => ({ x: c.x + CELL / 2, y: c.y + CELL / 2 });
  const end = route[route.length - 1];
  const before = route[route.length - 2];
  let dir = end.week > data.weeks.length / 2 ? 1 : -1;
  if (!before) dir = 1;
  else if (before.week !== end.week) dir = Math.sign(end.week - before.week);
  const pts = [
    { x: -16, y: mid(first).y },
    ...route.map(mid),
    { x: dir > 0 ? width + 16 : -16, y: mid(end).y },
  ];
  const { d, dist, length } = smooth(pts, CORNER);

  // 3. Timing
  const speed = Math.max(140, length / 38);          // units per second
  const headTime = length / speed;
  const tailTime = (length + BODY_LEN) / speed;
  const loop = tailTime + 2.4;                        // pause while the cells grow back
  const dur = `${loop.toFixed(2)}s`;
  const k = (s) => (s / loop).toFixed(5);
  const eatenAt = new Map();
  route.forEach((c, j) => { if (!eatenAt.has(id(c))) eatenAt.set(id(c), dist[j + 1] / speed); });

  // 4. Cells: grey base under every cell, coloured layer on top that vanishes when eaten.
  const base = items.map((c) =>
    `<rect class="c0" x="${c.x}" y="${c.y}" width="10" height="10" rx="2"/>`).join('');
  const fade = ((loop - 1.2) / loop).toFixed(5);
  const layer = items.filter((c) => c.level > 0).map((c) => {
    const open = `<rect class="c${c.level}" x="${c.x}" y="${c.y}" width="10" height="10" rx="2"`;
    const t = eatenAt.get(id(c));
    if (t === undefined) return `${open}/>`;
    return `${open}><animate attributeName="opacity" dur="${dur}" repeatCount="indefinite" ` +
      `keyTimes="0;${k(t)};${k(t + 0.25)};${fade};1" values="1;1;0;0;1"/></rect>`;
  }).join('');

  // 5. Snake: a dashed stroke slides along the path as the body; a rotating head leads it.
  const dash = `${BODY_LEN} ${(length + BODY_LEN * 2).toFixed(1)}`;
  const offsets = `${BODY_LEN};${(-length).toFixed(1)};${(-length).toFixed(1)}`;
  const tube = (w, color, extra = '') =>
    `<path d="${d}" pathLength="${length.toFixed(1)}" fill="none" stroke="${color}" stroke-width="${w}" ` +
    `stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${dash}"${extra}>` +
    `<animate attributeName="stroke-dashoffset" dur="${dur}" repeatCount="indefinite" ` +
    `keyTimes="0;${k(tailTime)};1" values="${offsets}"/></path>`;
  const head =
    `<g><animateMotion dur="${dur}" repeatCount="indefinite" rotate="auto" calcMode="linear" ` +
    `keyPoints="0;1;1" keyTimes="0;${k(headTime)};1" path="${d}"/>` +
    `<circle r="5.4" fill="${HEAD}"/>` +
    `<circle cx="2.4" cy="-2.7" r="1.7" fill="#fff"/><circle cx="2.4" cy="2.7" r="1.7" fill="#fff"/>` +
    `<circle cx="3" cy="-2.7" r=".8" fill="#161b22"/><circle cx="3" cy="2.7" r=".8" fill="#161b22"/></g>`;

  return svgWrap(width, height, base + layer + tube(8, BODY) + tube(2.4, SHINE, ' opacity="0.75"') + head);
}