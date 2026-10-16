# Contributing

Anyone can add an animation. Pull requests that pass the automatic checks are merged automatically.

## Add your animation

Use `svgWrap` from `core/grid.js` and give shapes `class="c0"` to `class="c4"`.
That gives you GitHub's real colours in both light and dark mode.

1. Fork this repo.
2. Create `animations/<your-slug>/` (lowercase letters, numbers, dashes).
3. Add two files:
   - `meta.json` with `name`, `author` (your GitHub username) and `description`
   - `index.js` with `export default function render(data) { return '<svg ...>' }`
4. Test locally: `npm run preview -- <your-slug>`, then open `dist/<your-slug>.svg`.
5. Run `npm run validate`.
6. Open a pull request.

## Rules

- Use your GitHub **noreply** email for commits (Settings -> Emails).
- Only touch your own folder. You can edit your own animations later.
- Only `index.js` and `meta.json` are allowed in an animation folder.
- No scripts, external URLs, images, links or event handlers in the SVG output.
- Output must be under 500 KB.
- Only the repo owner can delete or rename things.