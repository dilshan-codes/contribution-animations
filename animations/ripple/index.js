import { cells, svgWrap } from '../../core/grid.js';

export default function render(data) {
  const { items, width, height } = cells(data);
  const rects = items.map((c) =>
    `<rect class="c${c.level}" x="${c.x}" y="${c.y}" width="10" height="10" rx="2">` +
    `<animate attributeName="opacity" values="1;0.2;1" dur="2s" ` +
    `begin="${((c.week + c.day) * 0.05).toFixed(2)}s" repeatCount="indefinite"/></rect>`
  ).join('');
  return svgWrap(width, height, rects);
}