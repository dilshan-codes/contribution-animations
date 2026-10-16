import { cells, COLORS } from '../../core/grid.js';

const LENGTH = 5;   // snake body segments
const STEP = 0.06;  // seconds per cell
const BODY = '#a371f7';
const HEAD = '#6e40c9';

export default function render(data) {
  const { items, width, height } = cells(data);

  // Zig-zag path: down column 0, up column 1, down column 2, ...
  const byWeek = new Map();
  for (const c of items) {
    if (!byWeek.has(c.week)) byWeek.set(c.week, []);
    byWeek.get(c.week).push(c);
  }
  const path = [];
  [...byWeek.keys()].sort((a, b) => a - b).forEach((w, i) => {
    const col = byWeek.get(w).sort((a, b) => a.day - b.day);
    path.push(...(i % 2 ? col.reverse() : col));
  });

  const total = path.length + LENGTH;      // steps in one full loop
  const dur = (total * STEP).toFixed(2);
  const index = new Map(path.map((c, i) => [c, i]));

  // Grid cells: a cell turns empty at the moment the head reaches it.
  const rects = items.map((c) => {
    const base = `<rect x="${c.x}" y="${c.y}" width="10" height="10" rx="2" fill="${COLORS[c.level]}"`;
    if (c.level === 0) return `${base}/>`;
    const t = ((index.get(c) + 0.5) / total).toFixed(4);
    return `${base}><animate attributeName="fill" calcMode="discrete" dur="${dur}s" ` +
      `repeatCount="indefinite" keyTimes="0;${t};1" values="${COLORS[c.level]};${COLORS[0]};${COLORS[0]}"/></rect>`;
  }).join('');

  // Snake segments: segment k follows the head k steps behind.
  let snake = '';
  for (let k = LENGTH - 1; k >= 0; k--) {
    const xs = [], ys = [];
    for (let s = 0; s < total; s++) {
      const c = path[s - k];
      xs.push(c ? c.x : -20);
      ys.push(c ? c.y : -20);
    }
    snake += `<rect x="${xs[0]}" y="${ys[0]}" width="10" height="10" rx="2" fill="${k === 0 ? HEAD : BODY}">` +
      `<animate attributeName="x" calcMode="discrete" dur="${dur}s" repeatCount="indefinite" values="${xs.join(';')}"/>` +
      `<animate attributeName="y" calcMode="discrete" dur="${dur}s" repeatCount="indefinite" values="${ys.join(';')}"/></rect>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${rects}${snake}</svg>`;
}