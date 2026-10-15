import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { findProblems } from '../core/safety.js';

const root = path.resolve('animations');
const sample = JSON.parse(readFileSync('core/sample-data.json', 'utf8'));
const MAX_BYTES = 500 * 1024;
let failed = 0;
const fail = (slug, msg) => { console.error(`✗ ${slug}: ${msg}`); failed++; };

for (const slug of readdirSync(root)) {
  const dir = path.join(root, slug);
  if (!statSync(dir).isDirectory()) { fail(slug, 'files are not allowed directly in animations/'); continue; }
  if (!/^[a-z0-9-]+$/.test(slug)) { fail(slug, 'folder name must be lowercase letters, numbers, dashes'); continue; }
  const metaPath = path.join(dir, 'meta.json');
  const indexPath = path.join(dir, 'index.js');
  if (!existsSync(metaPath) || !existsSync(indexPath)) { fail(slug, 'needs meta.json and index.js'); continue; }

  let meta;
  try { meta = JSON.parse(readFileSync(metaPath, 'utf8')); } catch { fail(slug, 'meta.json is not valid JSON'); continue; }
  for (const k of ['name', 'author', 'description']) {
    if (typeof meta[k] !== 'string' || !meta[k].trim()) fail(slug, `meta.json is missing "${k}"`);
  }

  try {
    const mod = await import(pathToFileURL(indexPath).href);
    const svg = mod.default(structuredClone(sample), {});
    if (typeof svg !== 'string' || !svg.trimStart().startsWith('<svg')) throw new Error('render() must return an SVG string');
    if (Buffer.byteLength(svg) > MAX_BYTES) throw new Error('SVG is larger than 500 KB');
    const problems = findProblems(svg);
    if (problems.length) throw new Error(`forbidden content: ${problems.join(', ')}`);
  } catch (e) { fail(slug, e.message); continue; }
  console.log(`✓ ${slug}`);
}
process.exit(failed ? 1 : 0);