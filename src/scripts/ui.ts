/** Utilidades compartidas por los runners de "Conócete mejor" (autoevaluaciones y ejercicios). */
import { animarAltura, reducido, tiempos } from './motion';

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

interface Pantalla {
  html: string;
  after: () => void;
  focusSel: string;
}
export interface Render {
  (html: string, after: () => void, focusSel?: string): void;
  /** Altura de la que parte la próxima pantalla (p. ej., la de la introducción que se acaba de desvanecer). */
  desde: (altura: number) => void;
}

/**
 * Pinta una pantalla en `stage` y, ya en el DOM, ejecuta `after` para enganchar eventos.
 * Elegant Soft Motion: la pantalla anterior se desvanece con una subida mínima, la nueva entra con un fundido, la
 * altura del escenario pasa de una a otra sin saltos y la barra de progreso avanza desde donde estaba.
 * Si llega otra pantalla mientras la anterior sale, se pinta solo la última.
 */
export const crearRender = (root: HTMLElement, stage: HTMLElement): Render => {
  let pendiente: Pantalla | null = null;
  let saliendo = false;
  let alturaPrevia: number | null = null;
  let entrada: Animation | null = null;

  const pintar = () => {
    const p = pendiente;
    if (!p) return;
    pendiente = null;
    const t = tiempos();
    const desde = alturaPrevia ?? stage.getBoundingClientRect().height;
    alturaPrevia = null;
    const barraPrevia = stage.querySelector<HTMLElement>('.ev__progress-bar')?.style.width ?? '';

    stage.innerHTML = p.html;
    /* La barra de progreso nace con el ancho que tenía la anterior; más abajo avanza hasta el nuevo. */
    const barra = stage.querySelector<HTMLElement>('.ev__progress-bar');
    const destino = barra?.style.width ?? '';
    if (barra && barraPrevia && destino !== barraPrevia && !reducido()) barra.style.width = barraPrevia;
    p.after();
    const f = stage.querySelector<HTMLElement>(p.focusSel);
    if (f) f.focus({ preventScroll: true });
    const top = root.getBoundingClientRect().top + window.scrollY - 96;
    if (window.scrollY > top) window.scrollTo({ top, behavior: reducido() ? 'auto' : 'smooth' });

    stage.getAnimations().forEach((a) => a !== entrada && a.cancel());
    if (reducido()) return;
    const hasta = stage.getBoundingClientRect().height;
    if (desde > 0 && Math.abs(hasta - desde) >= 1) animarAltura(stage, desde, hasta, { duracion: t.lento + 40 });
    entrada = stage.animate(
      [
        { opacity: 0, transform: `translateY(${t.desliz + 4}px)` },
        { opacity: 1, transform: 'none' },
      ],
      { duration: t.base + 60, easing: t.curva },
    );
    if (barra && barra.style.width !== destino) barra.style.width = destino;
  };

  const render = ((html: string, after: () => void, focusSel = '[data-focus]') => {
    pendiente = { html, after, focusSel };
    if (saliendo) return;
    if (reducido() || !stage.innerHTML.trim()) {
      pintar();
      return;
    }
    saliendo = true;
    const t = tiempos();
    const desdeOpacidad = parseFloat(getComputedStyle(stage).opacity) || 1;
    entrada?.cancel();
    entrada = null;
    const salida = stage.animate(
      [
        { opacity: desdeOpacidad, transform: 'none' },
        { opacity: 0, transform: `translateY(-${t.desliz}px)` },
      ],
      { duration: t.salida, easing: t.curvaSalida, fill: 'forwards' },
    );
    salida.finished.then(
      () => {
        saliendo = false;
        pintar();
        salida.cancel();
      },
      () => {
        saliendo = false;
      },
    );
  }) as Render;
  render.desde = (altura: number) => {
    alturaPrevia = altura;
  };
  return render;
};

export const crearAnunciar = (live: HTMLElement) => (msg: string) => {
  live.textContent = '';
  window.setTimeout(() => (live.textContent = msg), 50);
};
