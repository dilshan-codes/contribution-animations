// Rules that every submitted SVG must pass.
const RULES = [
  [/<script/i, 'script tag'],
  [/<foreignObject/i, 'foreignObject'],
  [/<iframe|<embed|<object/i, 'embedded content'],
  [/<image|<a[\s>]/i, 'image or link element'],
  [/\son[a-z]+\s*=/i, 'event handler attribute'],
  [/javascript:/i, 'javascript: URL'],
  [/@import/i, 'CSS @import'],
  [/url\(\s*(?!['"]?#)/i, 'non-local url()'],
  [/(href|src)\s*=\s*(?!['"]#)/i, 'external reference'],
  [/https?:\/\/(?!www\.w3\.org\/2000\/svg)/i, 'external URL'],
];

export function findProblems(svg) {
  return RULES.filter(([re]) => re.test(svg)).map(([, label]) => label);
}