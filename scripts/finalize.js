import { readdirSync, readFileSync, writeFileSync, rmSync, lstatSync, existsSync } from 'node:fs';
import { findProblems } from '../core/safety.js';

const MAX = 500 * 1024;
const clean = (s, n) => String(s ?? '').replace(/[^\p{L}\p{N} .,'!?-]/gu, '').slice(0, n);
const entries = [];

for (const f of readdirSync('dist')) {
  const p = `dist/${f}`;
  const slug = f.replace(/\.svg$/, '');
  let keep = /^[a-z0-9-]+\.svg$/.test(f) && lstatSync(p).isFile() && existsSync(`animations/${slug}/meta.json`);
  let meta;
  if (keep) {
    const svg = readFileSync(p, 'utf8');
    if (svg.length > MAX || !svg.trimStart().startsWith('<svg') || findProblems(svg).length) keep = false;
    try { meta = JSON.parse(readFileSync(`animations/${slug}/meta.json`, 'utf8')); } catch { keep = false; }
  }
  if (!keep) { console.error(`removed ${f}`); rmSync(p, { recursive: true, force: true }); continue; }
  entries.push({
    slug,
    name: clean(meta.name, 60) || slug,
    description: clean(meta.description, 200),
    author: /^[A-Za-z0-9-]{1,39}$/.test(String(meta.author)) ? meta.author : null,
  });
}

entries.sort((a, b) => a.slug.localeCompare(b.slug));
const body = entries.map((e) =>
  `### ${e.name}\n${e.author ? `by [@${e.author}](https://github.com/${e.author})\n` : ''}\n${e.description}\n\n![${e.name}](./${e.slug}.svg)\n`
).join('\n');
writeFileSync('dist/README.md', `# Animation gallery\n\nGenerated automatically from a real contribution graph.\n\n${body}`);
console.log(`Published ${entries.length} animations`);