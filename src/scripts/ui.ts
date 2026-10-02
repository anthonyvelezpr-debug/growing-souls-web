/** Utilidades compartidas por los runners de "Conócete mejor" (autoevaluaciones y ejercicios). */

export const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c] as string,
  );

/** Texto escrito por la persona: escapado y con saltos de línea respetados. */
export const escMultilinea = (s: string) => esc(s).replace(/\n/g, '<br>');

export interface LineaCrisis {
  label: string;
  number: string;
  href: string;
}

export const crisisHtml = (lineas: LineaCrisis[]) =>
  lineas
    .map(
      (l) => `
      <li class="ev__crisis-item">
        <a class="ev__crisis-number" href="${esc(l.href)}">${esc(l.number)}</a>
        <span class="ev__crisis-label small">${esc(l.label)}</span>
      </li>`,
    )
    .join('');

/**
 * Pinta una pantalla en `stage` con un fundido breve y, ya en el DOM, ejecuta `after` para enganchar eventos.
 * Devuelve la función `render` ligada a ese escenario.
 */
export const crearRender = (root: HTMLElement, stage: HTMLElement) => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return (html: string, after: () => void, focusSel = '[data-focus]') => {
    const paint = () => {
      stage.innerHTML = html;
      stage.classList.remove('is-leaving');
      after();
      const f = stage.querySelector<HTMLElement>(focusSel);
      if (f) f.focus({ preventScroll: true });
      const top = root.getBoundingClientRect().top + window.scrollY - 96;
      if (window.scrollY > top) window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    };
    if (reduced || !stage.innerHTML) paint();
    else {
      stage.classList.add('is-leaving');
      window.setTimeout(paint, 180);
    }
  };
};

export const crearAnunciar = (live: HTMLElement) => (msg: string) => {
  live.textContent = '';
  window.setTimeout(() => (live.textContent = msg), 50);
};
