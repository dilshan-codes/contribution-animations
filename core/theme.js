// GitHub's real contribution colours. Level 0 is the grey "no contributions" cell.
export const LIGHT = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
export const DARK = ['#151b23', '#033a16', '#196c2e', '#2ea043', '#56d364'];

// Gives shapes class="c0".."c4" and switches palette with the viewer's colour scheme.
export function styleBlock() {
  const rules = (list) => list.map((c, i) => `.c${i}{fill:${c}}`).join('');
  return `<style>${rules(LIGHT)}@media (prefers-color-scheme:dark){${rules(DARK)}}</style>`;
}