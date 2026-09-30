// Genera dist-preview/artifact-index.html: la Home sin doctype/html/head/body,
// porque el host de la vista previa envuelve la página raíz en su propio esqueleto.
import { readFileSync, writeFileSync } from 'node:fs';
const html = readFileSync('dist-preview/index.html', 'utf8');
const head = html.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? '';
const bodyMatch = html.match(/<body([^>]*)>([\s\S]*?)<\/body>/i);
const body = bodyMatch?.[2] ?? '';
let headKeep = head
  .replace(/<meta charset[^>]*>/i, '')
  .replace(/<meta name="viewport"[^>]*>/i, '')
  .replace(/<title>[\s\S]*?<\/title>/i, '<title>Growing Souls</title>')
  .replace(/<link rel="canonical"[^>]*>/i, '');
const out = `${headKeep.trim()}\n<style>html,body{margin:0;padding:0}:root{padding:0}</style>\n${body.trim()}\n`;
writeFileSync('dist-preview/artifact-index.html', out);
console.log('artifact-root: ok', out.length, 'bytes');
