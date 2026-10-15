import { readFileSync, existsSync } from 'node:fs';

const { required } = JSON.parse(readFileSync('manifest.json', 'utf8'));
const missing = required.filter((s) => !existsSync(`animations/${s}/index.js`));
if (missing.length) {
  console.error(`✗ Missing required animations: ${missing.join(', ')}`);
  process.exit(1);
}
console.log(`✓ All ${required.length} required animations are present`);