/**
 * Elegant Soft Motion · el movimiento de Growing Souls.
 *
 * Todo lo que abre, cierra, aparece o cambia en la web usa estas piezas, con las duraciones y curvas de
 * src/styles/tokens.css: fundidos sutiles, deslizamientos cortos y alturas que se abren poco a poco, sin rebotes.
 * Nada aparece ni desaparece de golpe: el espacio se abre o se cierra con suavidad y el contenido llega o se va con un
 * fundido. Con prefers-reduced-motion, los cambios ocurren al instante.
 */

interface Tiempos {
  rapido: number;
  base: number;
  lento: number;
  salida: number;
  curva: string;
  curvaAltura: string;
  curvaSalida: string;
  desliz: number;
}

const valor = (nombre: string) => getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
const ms = (nombre: string, respaldo: number) => {
  const v = valor(nombre);
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return respaldo;
  return v.endsWith('ms') ? n : v.endsWith('s') ? n * 1000 : n;
};

let cache: Tiempos | null = null;
/** Los tokens de movimiento de CSS, leídos una vez. */
export const tiempos = (): Tiempos =>
  (cache ??= {
    rapido: ms('--dur-fast', 300),
    base: ms('--dur-base', 400),
    lento: ms('--dur-slow', 480),
    salida: ms('--dur-exit', 280),
    curva: valor('--ease') || 'cubic-bezier(0.33, 0, 0.2, 1)',
    curvaAltura: valor('--ease-in-out') || 'cubic-bezier(0.42, 0, 0.25, 1)',
    curvaSalida: valor('--ease-exit') || 'cubic-bezier(0.4, 0, 0.6, 1)',
    desliz: parseFloat(valor('--nudge')) || 6,
  });

export const reducido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const silencio = () => false;

/* ---------- Alturas ---------- */

const alturas = new WeakMap<HTMLElement, Animation>();
const overflowOriginal = new WeakMap<HTMLElement, string>();

/** Anima la altura de `el` entre dos medidas, con el contenido recortado mientras dura. */
export function animarAltura(
  el: HTMLElement,
  desde: number,
  hasta: number,
  { duracion, fill = 'none' }: { duracion?: number; fill?: FillMode } = {},
): Animation {
  const t = tiempos();
  const previa = alturas.get(el);
  if (!previa) overflowOriginal.set(el, el.style.overflow);
  previa?.cancel();
  el.style.overflow = 'hidden';
  const a = el.animate([{ height: `${desde}px` }, { height: `${hasta}px` }], {
    duration: duracion ?? t.lento,
    easing: t.curvaAltura,
    fill,
  });
  alturas.set(el, a);
  const fin = () => {
    if (alturas.get(el) !== a) return;
    alturas.delete(el);
    el.style.overflow = overflowOriginal.get(el) ?? '';
  };
  a.finished.then(fin, fin);
  return a;
}

/** Detiene una animación de altura en curso y devuelve la altura que se veía en ese momento. */
const alturaActual = (el: HTMLElement) => {
  const h = el.getBoundingClientRect().height;
  alturas.get(el)?.cancel();
  return h;
};

/**
 * Cambia el DOM dentro de `cont` y anima su altura de la medida anterior a la nueva, para que lo que viene después
 * baje o suba con suavidad en lugar de saltar.
 */
export function alturaSuave(cont: HTMLElement, cambio: () => void, duracion?: number): Promise<boolean> {
  const desde = alturaActual(cont);
  cambio();
  if (reducido()) return Promise.resolve(true);
  const hasta = cont.getBoundingClientRect().height;
  if (Math.abs(hasta - desde) < 1) return Promise.resolve(true);
  return animarAltura(cont, desde, hasta, { duracion }).finished.then(() => true, silencio);
}

/* ---------- Mostrar y ocultar ---------- */

const fundidos = new WeakMap<HTMLElement, Animation>();
const opacidad = (el: HTMLElement) => parseFloat(getComputedStyle(el).opacity) || 0;

/**
 * Muestra un elemento oculto con `hidden`: su espacio se abre poco a poco y el contenido aparece con un fundido y
 * un deslizamiento mínimo. `cont` es el bloque cuya altura se anima (por defecto, el padre).
 */
export function mostrar(el: HTMLElement, { cont = el.parentElement }: { cont?: HTMLElement | null } = {}): Promise<boolean> {
  const saliendo = el.dataset.motion === 'saliendo';
  if (!el.hidden && !saliendo) return Promise.resolve(true);
  const t = tiempos();
  const desdeOpacidad = saliendo ? opacidad(el) : 0;
  fundidos.get(el)?.cancel();
  delete el.dataset.motion;
  const abrir = () => {
    el.hidden = false;
  };
  if (reducido() || !cont) {
    abrir();
    return Promise.resolve(true);
  }
  const altura = alturaSuave(cont, abrir);
  const fundido = el.animate(
    [
      { opacity: desdeOpacidad, transform: `translateY(-${t.desliz}px)` },
      { opacity: 1, transform: 'none' },
    ],
    { duration: t.base, easing: t.curva },
  );
  fundidos.set(el, fundido);
  return Promise.all([altura, fundido.finished.then(() => true, silencio)]).then(([, ok]) => ok);
}

/** Oculta un elemento: el contenido se desvanece mientras su espacio se cierra; al terminar, queda con `hidden`. */
export function ocultar(el: HTMLElement, { cont = el.parentElement }: { cont?: HTMLElement | null } = {}): Promise<boolean> {
  if (el.hidden || el.dataset.motion === 'saliendo') return Promise.resolve(true);
  const t = tiempos();
  const desdeOpacidad = opacidad(el);
  fundidos.get(el)?.cancel();
  if (reducido() || !cont) {
    el.hidden = true;
    return Promise.resolve(true);
  }
  el.dataset.motion = 'saliendo';
  const desde = alturaActual(cont);
  el.hidden = true;
  const hasta = cont.getBoundingClientRect().height;
  el.hidden = false;
  const fundido = el.animate(
    [
      { opacity: desdeOpacidad, transform: 'none' },
      { opacity: 0, transform: `translateY(-${t.desliz / 2}px)` },
    ],
    { duration: t.salida, easing: t.curvaSalida, fill: 'forwards' },
  );
  fundidos.set(el, fundido);
  const altura = Math.abs(hasta - desde) >= 1 ? animarAltura(cont, desde, hasta, { fill: 'forwards' }) : null;
  return Promise.all([fundido.finished, altura?.finished]).then(
    () => {
      if (el.dataset.motion !== 'saliendo') return false;
      el.hidden = true;
      delete el.dataset.motion;
      fundido.cancel();
      altura?.cancel();
      return true;
    },
    silencio,
  );
}

/** Muestra u oculta según `visible`, con el mismo lenguaje en ambos sentidos. */
export const alternar = (el: HTMLElement, visible: boolean, opciones?: { cont?: HTMLElement | null }) =>
  visible ? mostrar(el, opciones) : ocultar(el, opciones);

/** Desvanece un elemento sin cerrar su espacio; queda transparente hasta que quien llama lo oculte o lo quite. */
export function desvanecer(el: HTMLElement): Promise<boolean> {
  if (reducido()) return Promise.resolve(true);
  const t = tiempos();
  const a = el.animate(
    [
      { opacity: opacidad(el), transform: 'none' },
      { opacity: 0, transform: `translateY(-${t.desliz}px)` },
    ],
    { duration: t.salida, easing: t.curvaSalida, fill: 'forwards' },
  );
  return a.finished.then(() => true, silencio);
}

/** Aparición de un bloque recién pintado: fundido y subida mínima. */
export function aparecer(el: HTMLElement, { retraso = 0 }: { retraso?: number } = {}): Animation | null {
  if (reducido()) return null;
  const t = tiempos();
  return el.animate(
    [
      { opacity: 0, transform: `translateY(${t.desliz + 2}px)` },
      { opacity: 1, transform: 'none' },
    ],
    { duration: t.base + 40, easing: t.curva, delay: retraso, fill: 'backwards' },
  );
}

/** Cambia el texto de un botón o de una etiqueta con un fundido cruzado breve. */
export function cambiarTexto(el: HTMLElement, texto: string): void {
  if (reducido()) {
    el.textContent = texto;
    return;
  }
  const t = tiempos();
  const salida = el.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: t.salida * 0.7,
    easing: t.curvaSalida,
    fill: 'forwards',
  });
  salida.finished.then(() => {
    el.textContent = texto;
    el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: t.base, easing: t.curva });
    salida.cancel();
  }, silencio);
}

/* ---------- Acordeones (details/summary) ---------- */

/**
 * Abre o cierra un <details> con la altura animada: al abrir, el espacio se expande y el contenido aparece con un
 * fundido; al cerrar, el contenido se desvanece mientras el espacio se recoge. Si se pulsa a mitad de camino, invierte
 * el movimiento desde donde va. La clase `is-open` marca el estado visual (el icono gira con ella).
 */
function alternarDetails(d: HTMLDetailsElement) {
  const t = tiempos();
  const summary = d.querySelector<HTMLElement>(':scope > summary');
  if (!summary) return;
  const cuerpo = [...d.children].filter((c): c is HTMLElement => c !== summary && c instanceof HTMLElement);
  const abrir = !d.open || d.dataset.motion === 'cerrando';
  const desde = alturaActual(d);
  const opacidades = cuerpo.map((c) => (d.open ? opacidad(c) : 0));
  cuerpo.forEach((c) => fundidos.get(c)?.cancel());

  if (abrir) {
    d.dataset.motion = 'abriendo';
    d.open = true;
    d.classList.add('is-open');
    const hasta = d.getBoundingClientRect().height;
    animarAltura(d, desde, hasta).finished.then(() => {
      if (d.dataset.motion === 'abriendo') delete d.dataset.motion;
    }, silencio);
    cuerpo.forEach((c, k) => {
      const a = c.animate(
        [
          { opacity: opacidades[k], transform: `translateY(-${t.desliz}px)` },
          { opacity: 1, transform: 'none' },
        ],
        { duration: t.lento, easing: t.curva, delay: opacidades[k] > 0 ? 0 : 60, fill: 'backwards' },
      );
      fundidos.set(c, a);
    });
    return;
  }

  d.dataset.motion = 'cerrando';
  d.classList.remove('is-open');
  d.open = false;
  const hasta = d.getBoundingClientRect().height;
  d.open = true;
  const altura = animarAltura(d, desde, hasta, { fill: 'forwards' });
  const salidas = cuerpo.map((c, k) => {
    const a = c.animate([{ opacity: opacidades[k] }, { opacity: 0 }], {
      duration: t.salida,
      easing: t.curvaSalida,
      fill: 'forwards',
    });
    fundidos.set(c, a);
    return a;
  });
  altura.finished.then(() => {
    if (d.dataset.motion !== 'cerrando') return;
    d.open = false;
    delete d.dataset.motion;
    altura.cancel();
    salidas.forEach((a) => a.cancel());
  }, silencio);
}

let detallesListos = false;
/** Activa el movimiento suave en todos los acordeones de la página, también en los que se pintan después. */
export function iniciarDetalles(): void {
  if (detallesListos) return;
  detallesListos = true;
  document.querySelectorAll('details').forEach((d) => d.classList.toggle('is-open', d.open));
  document.addEventListener('click', (e) => {
    const summary = (e.target as Element | null)?.closest?.('summary');
    const d = summary?.parentElement;
    if (!summary || !(d instanceof HTMLDetailsElement) || d.querySelector(':scope > summary') !== summary) return;
    if (reducido()) return;
    e.preventDefault();
    alternarDetails(d);
  });
  /* Si el navegador abre o cierra un acordeón por su cuenta (búsqueda en la página, impresión, movimiento
     reducido), el estado visual lo acompaña. */
  document.addEventListener(
    'toggle',
    (e) => {
      const d = e.target;
      if (d instanceof HTMLDetailsElement && !d.dataset.motion) d.classList.toggle('is-open', d.open);
    },
    true,
  );
}
