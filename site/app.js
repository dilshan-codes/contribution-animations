const $ = (id) => document.getElementById(id);
const grid = $('grid'), search = $('search'), dialog = $('dialog'), user = $('username');
const VALID_USER = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
let repo = '', all = [], current = null;

const workflow = (slug) => `name: Contribution animation
on:
  schedule:
    - cron: "0 */12 * * *"
  workflow_dispatch:
permissions:
  contents: write
jobs:
  animate:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: ${repo}@v1
        with:
          animations: ${slug}
`;

const readme = (slug, u) => `![contribution animation](https://raw.githubusercontent.com/${u}/${u}/output/${slug}.svg)

[🔄 Update animation](https://github.com/${u}/${u}/actions/workflows/contribution-animation.yml)
`;

// Everything from animations.json is shown with textContent, never as HTML.
function card(a) {
  const el = document.createElement('article');
  el.className = 'card';

  const img = new Image();
  img.src = `previews/${a.slug}.svg`;
  img.alt = `${a.name} preview`;
  img.loading = 'lazy';

  const h = document.createElement('h2');
  h.textContent = a.name;

  const p = document.createElement('p');
  p.textContent = a.description;

  const by = document.createElement('p');
  by.className = 'by';
  by.append('by ');
  if (a.author) {
    const link = document.createElement('a');
    link.href = `https://github.com/${a.author}`;
    link.textContent = `@${a.author}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    by.append(link);
  } else {
    by.append('unknown');
  }
  if (a.created) by.append(` · added ${a.created}`);

  const btn = document.createElement('button');
  btn.textContent = 'Use this animation';
  btn.addEventListener('click', () => openDialog(a.slug));

  el.append(img, h, p, by, btn);
  return el;
}

function render() {
  const q = search.value.trim().toLowerCase();
  const list = all.filter((a) =>
    !q || [a.name, a.description, a.author ?? '', a.slug].some((s) => s.toLowerCase().includes(q)));
  grid.replaceChildren(...list.map(card));
  $('count').textContent = `${list.length} animation${list.length === 1 ? '' : 's'}`;
}

function fillSnippets() {
  if (!current) return;
  const u = VALID_USER.test(user.value.trim()) ? user.value.trim() : 'USERNAME';
  $('s-workflow').textContent = workflow(current.slug);
  $('s-readme').textContent = readme(current.slug, u);
}

function openDialog(slug) {
  const a = all.find((x) => x.slug === slug);
  if (!a) return;
  current = a;
  $('d-title').textContent = a.name;
  $('d-meta').textContent = `${a.description}${a.author ? ` · by @${a.author}` : ''}${a.created ? ` · added ${a.created}` : ''}`;
  $('d-img').src = `previews/${a.slug}.svg`;
  $('d-img').alt = `${a.name} preview`;
  fillSnippets();
  history.replaceState(null, '', `#${a.slug}`);
  if (!dialog.open) dialog.showModal();
}

function fromHash() {
  const slug = decodeURIComponent(location.hash.slice(1));
  if (slug && all.some((a) => a.slug === slug)) openDialog(slug);
}

search.addEventListener('input', render);
user.addEventListener('input', fillSnippets);
$('close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => history.replaceState(null, '', location.pathname));
window.addEventListener('hashchange', fromHash);

document.querySelectorAll('[data-copy]').forEach((btn) =>
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($(btn.dataset.copy).textContent);
      btn.textContent = 'Copied ✓';
    } catch {
      btn.textContent = 'Select and copy manually';
    }
    setTimeout(() => { btn.textContent = 'Copy'; }, 1800);
  }));

try {
  const res = await fetch('animations.json');
  if (!res.ok) throw new Error(res.status);
  const data = await res.json();
  repo = data.repo;
  all = data.animations.sort((a, b) => (b.created || '').localeCompare(a.created || '') || a.name.localeCompare(b.name));
  $('repo-link').href = `https://github.com/${repo}`;
  render();
  fromHash();
} catch {
  $('count').textContent = 'Could not load the animation list.';
}