import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const slug = process.argv[2];
if (!slug) { console.error('Usage: npm run preview -- <slug>'); process.exit(1); }
const sample = JSON.parse(readFileSync('core/sample-data.json', 'utf8'));
const mod = await import(pathToFileURL(path.resolve('animations', slug, 'index.js')).href);
mkdirSync('dist', { recursive: true });
writeFileSync(`dist/${slug}.svg`, mod.default(sample, {}));
console.log(`Open dist/${slug}.svg in your browser`);