// Convierte el build (dist/) en una copia con rutas relativas (dist-preview/)
// para poder publicarlo como vista previa en un host que no sirve desde la raíz.
// Producción no usa esto: GitHub Pages sirve dist/ tal cual desde la raíz del dominio.
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';

const src = 'dist';
const out = 'dist-preview';
rmSync(out, { recursive: true, force: true });
cpSync(src, out, { recursive: true });

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(p);
  }
})(out);

const resolvePage = (path) => {
  // "/como-trabajo/" → "como-trabajo/index.html" ; "/" → "index.html"
  const clean = path.replace(/^\//, '').replace(/\/$/, '');
  if (clean === '') return 'index.html';
  if (existsSync(join(out, clean, 'index.html'))) return `${clean}/index.html`;
  if (existsSync(join(out, `${clean}.html`))) return `${clean}.html`;
  return clean; // recurso estático (imagen, fuente, css)
};

for (const file of files) {
  const depth = relative(out, dirname(file)).split(sep).filter(Boolean).length;
  const prefix = depth === 0 ? './' : '../'.repeat(depth);

  if (file.endsWith('.html')) {
    let html = readFileSync(file, 'utf8');
    // href/src/content/poster/action con ruta absoluta interna
    html = html.replace(/\b(href|src|poster|action)="\/(?!\/)([^"#?]*)([#?][^"]*)?"/g, (_, attr, path, rest = '') => {
      if (attr === 'href' && (path.startsWith('fonts/') || path.startsWith('images/') || /\.[a-z0-9]+$/i.test(path))) {
        return `${attr}="${prefix}${path}${rest}"`;
      }
      if (attr === 'src' || attr === 'poster') return `${attr}="${prefix}${path}${rest}"`;
      return `${attr}="${prefix}${resolvePage('/' + path)}${rest}"`;
    });
    // srcset con varias rutas
    html = html.replace(/\bsrcset="([^"]*)"/g, (_, value) => {
      const fixed = value
        .split(',')
        .map((part) => part.trim().replace(/^\/(?!\/)/, prefix))
        .join(', ');
      return `srcset="${fixed}"`;
    });
    // url(/...) en estilos inline
    html = html.replace(/url\((['"]?)\/(?!\/)/g, (_, q) => `url(${q}${prefix}`);
    writeFileSync(file, html);
  } else if (file.endsWith('.css')) {
    let css = readFileSync(file, 'utf8');
    css = css.replace(/url\((['"]?)\/(?!\/)/g, (_, q) => `url(${q}${prefix}`);
    writeFileSync(file, css);
  } else if (file.endsWith('.js')) {
    let js = readFileSync(file, 'utf8');
    js = js.replace(/(["'`])\/(_astro\/[^"'`]+)\1/g, (_, q, path) => `${q}${prefix}${path}${q}`);
    writeFileSync(file, js);
  }
}

// El host de la vista previa reserva los nombres que empiezan por "_": renombramos _astro → assets.
import { renameSync } from 'node:fs';
if (existsSync(join(out, '_astro'))) {
  renameSync(join(out, '_astro'), join(out, 'assets'));
  for (const file of files) {
    const target = file.includes(`${sep}_astro${sep}`) ? file.replace(`${sep}_astro${sep}`, `${sep}assets${sep}`) : file;
    if (/\.(html|css|js)$/.test(target) && existsSync(target)) {
      writeFileSync(target, readFileSync(target, 'utf8').replaceAll('_astro/', 'assets/'));
    }
  }
}

console.log(`make-relative: ${files.length} archivos copiados a ${out}/ con rutas relativas.`);
