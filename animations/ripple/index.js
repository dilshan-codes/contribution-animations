import { cells, COLORS } from '../../core/grid.js';

export default function render(data) {
  const { items, width, height } = cells(data);
  const rects = items.map((c) =>
    `<rect x="${c.x}" y="${c.y}" width="10" height="10" rx="2" fill="${COLORS[c.level]}">` +
    `<animate attributeName="opacity" values="1;0.2;1" dur="2s" ` +
    `begin="${((c.week + c.day) * 0.05).toFixed(2)}s" repeatCount="indefinite"/></rect>`
  ).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${rects}</svg>`;
}