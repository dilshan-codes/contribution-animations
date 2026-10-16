import { mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const dataFile = process.argv[2] || 'core/sample-data.json';
const data = JSON.parse(readFileSync(dataFile, 'utf8'));

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });

let ok = 0;
for (const slug of readdirSync('animations')) {
  if (!/^[a-z0-9-]+$/.test(slug)) continue;
  try {
    const mod = await import(pathToFileURL(path.resolve('animations', slug, 'index.js')).href);
    const svg = mod.default(structuredClone(data), {});
    if (typeof svg !== 'string') throw new Error('render() must return a string');
    writeFileSync(`dist/${slug}.svg`, svg);
    ok++;
    console.log(`✓ ${slug}`);
  } catch (e) {
    console.error(`✗ ${slug}: ${e.message}`);   // one broken animation never stops the others
  }
}
process.exit(ok ? 0 : 1);