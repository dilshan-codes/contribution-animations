import { mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const dataFile = process.argv[2] || 'core/sample-data.json';
const out = process.env.DIST || 'dist';
const only = (process.env.ONLY || '').split(',').map((s) => s.trim()).filter(Boolean);
const wanted = (slug) => !only.length || only.includes('all') || only.includes(slug);

const data = JSON.parse(readFileSync(dataFile, 'utf8'));
mkdirSync(out, { recursive: true });
for (const f of readdirSync(out)) rmSync(path.join(out, f), { recursive: true, force: true });

let ok = 0;
for (const slug of readdirSync('animations')) {
  if (!/^[a-z0-9-]+$/.test(slug) || !wanted(slug)) continue;
  try {
    const mod = await import(pathToFileURL(path.resolve('animations', slug, 'index.js')).href);
    const svg = mod.default(structuredClone(data), {});
    if (typeof svg !== 'string') throw new Error('render() must return a string');
    writeFileSync(path.join(out, `${slug}.svg`), svg);
    ok++;
    console.log(`✓ ${slug}`);
  } catch (e) {
    console.error(`✗ ${slug}: ${e.message}`);   // one broken animation never stops the others
  }
}
if (!ok) console.error('No animation was built. Check the animation names.');
process.exit(ok ? 0 : 1);