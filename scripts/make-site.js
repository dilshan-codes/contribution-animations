import { cpSync, copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const SRC = process.env.DIST || 'dist';   // already re-scanned by finalize.js
const OUT = '_site';
const clean = (s, n) => String(s ?? '').replace(/[^\p{L}\p{N} .,'!?-]/gu, '').slice(0, n);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(path.join(OUT, 'previews'), { recursive: true });
cpSync('site', OUT, { recursive: true });

const animations = [];
for (const f of readdirSync(SRC)) {
  if (!/^[a-z0-9-]+\.svg$/.test(f)) continue;
  const slug = f.slice(0, -4);

  let meta;
  try { meta = JSON.parse(readFileSync(`animations/${slug}/meta.json`, 'utf8')); } catch { continue; }

  // Creation date = first commit that added the folder (needs full git history)
  let created = '';
  try {
    const log = execFileSync('git', ['log', '--diff-filter=A', '--format=%aI', '--', `animations/${slug}/meta.json`], { encoding: 'utf8' });
    created = log.trim().split('\n').pop().slice(0, 10);
  } catch { /* leave empty */ }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(created)) created = '';

  copyFileSync(path.join(SRC, f), path.join(OUT, 'previews', f));
  animations.push({
    slug,
    name: clean(meta.name, 60) || slug,
    description: clean(meta.description, 200),
    author: /^[A-Za-z0-9-]{1,39}$/.test(String(meta.author)) ? meta.author : null,
    created,
  });
}

const repo = /^[\w.-]+\/[\w.-]+$/.test(process.env.GITHUB_REPOSITORY ?? '')
  ? process.env.GITHUB_REPOSITORY
  : 'dilshan-codes/contribution-animations';
writeFileSync(path.join(OUT, 'animations.json'), JSON.stringify({ repo, animations }));
console.log(`Site built with ${animations.length} animations`);