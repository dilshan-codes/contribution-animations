import { writeFileSync } from 'node:fs';

let seed = 42;
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const start = Date.UTC(2025, 0, 5); // a Sunday
const weeks = [];
for (let w = 0; w < 53; w++) {
  const days = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(start + (w * 7 + d) * 86400000).toISOString().slice(0, 10);
    const count = rnd() < 0.35 ? 0 : Math.floor(rnd() * 12) + 1;
    days.push({ date, count, level: count === 0 ? 0 : Math.min(4, Math.ceil(count / 3)) });
  }
  weeks.push({ days });
}
writeFileSync(new URL('../core/sample-data.json', import.meta.url), JSON.stringify({ weeks }));