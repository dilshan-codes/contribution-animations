import { LIGHT, styleBlock } from './theme.js';

export const CELL = 10, GAP = 3, PAD = 5;
export const COLORS = LIGHT; // kept so older animations still work

// Turns the data into positioned cells. day = weekday (0 = Sunday).
export function cells(data) {
  const items = [];
  data.weeks.forEach((w, week) =>
    w.days.forEach((d) => {
      const day = new Date(d.date + 'T00:00:00Z').getUTCDay();
      items.push({
        week, day, date: d.date, count: d.count, level: d.level,
        x: PAD + week * (CELL + GAP),
        y: PAD + day * (CELL + GAP),
      });
    })
  );
  const width = PAD * 2 + data.weeks.length * (CELL + GAP) - GAP;
  const height = PAD * 2 + 7 * (CELL + GAP) - GAP;
  return { items, width, height };
}

// Wraps shapes in an <svg> that carries GitHub's light and dark palettes.
// Give shapes class="c0".."c4" to use them.
export function svgWrap(width, height, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${styleBlock()}${inner}</svg>`;
}