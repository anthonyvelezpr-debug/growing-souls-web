// Cuenta las marcas data-verify que quedan en el build. Falla si hay alguna.
// Uso: node scripts/check-verify.mjs [dist]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? 'dist';
const found = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) {
      const html = readFileSync(p, 'utf8');
      const re = /data-verify="([^"]*)"/g;
      let m;
      while ((m = re.exec(html))) found.push({ file: p, note: m[1] });
    }
  }
}

walk(root);

if (found.length === 0) {
  console.log('check-verify: sin marcas pendientes. Listo para publicar.');
  process.exit(0);
}

const byFile = new Map();
for (const f of found) byFile.set(f.file, [...(byFile.get(f.file) ?? []), f.note]);
console.log(`check-verify: ${found.length} marca(s) pendiente(s) en ${byFile.size} archivo(s):\n`);
for (const [file, notes] of byFile) {
  console.log(`  ${file}`);
  for (const n of notes) console.log(`    - ${n}`);
}
process.exit(1);
