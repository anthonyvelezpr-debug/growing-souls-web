/**
 * Runner de un ejercicio de profundidad: un paso por pantalla (lectura, pausa con respiración, escritura con
 * temporizador suave, selección, escala, áreas, marcar una frase), paso de datos opcional y reflejo final con las
 * propias palabras de la persona.
 *
 * Lo escrito vive en sessionStorage (solo esta pestaña) para no perderlo con una recarga accidental, y se puede
 * borrar al final. Nada sale del dispositivo: si hay destino de contactos, solo viaja qué ejercicio y la fecha.
 *
 * Estados: intro → paso(i) → [datos] → reflejo
 */
import { ejercicios, intensidades, type Bloque, type Paso, type Respuestas } from '../data/ejercicios';
import type { EjercicioPayload } from '../lib/leads';
import { pasoDatos, type Enviado } from './datos-paso';
import { crearAnunciar, crearRender, crisisHtml, esc, escMultilinea, type LineaCrisis } from './ui';

interface Config {
  crisis: LineaCrisis[];
  whatsappHref: string;
  citaHref: string;
  leadsEndpoint: string;
  privacidadHref: string;
  indiceHref: string;
  textos: { privacidad: string; dispositivo: string };
}

const root = document.querySelector<HTMLElement>('[data-ejercicio]');
const dataEl = document.getElementById('ejercicio-data');
const ej = ejercicios.find((e) => e.id === root?.dataset.ejercicio);

if (root && dataEl && ej) {
  const cfg = JSON.parse(dataEl.textContent || '{}') as Config;
  const total = ej.pasos.length;
  const stage = root.querySelector<HTMLElement>('[data-stage]')!;
  const intro = root.querySelector<HTMLElement>('[data-intro]')!;
  const live = root.querySelector<HTMLElement>('[data-live]')!;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const puntero = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const inicio = Date.now();
  const KEY = `gs-ejercicio-${ej.id}`;

  const anunciar = crearAnunciar(live);
  const render = crearRender(root, stage);

  /* ---------- Estado y borrador ---------- */
  let r: Respuestas = {};
  let actual = 0;
  let viaPuntero = false;
  let temporizador: number | null = null;
  let respiracion: number[] = [];

  const leerBorrador = () => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (!raw) return false;
      const o = JSON.parse(raw) as { r?: Respuestas; paso?: number };
      r = o.r && typeof o.r === 'object' ? o.r : {};
      actual = Math.max(0, Math.min(Number(o.paso) || 0, total - 1));
      return Object.keys(r).length > 0;
    } catch {
      return false;
    }
  };
  const guardar = () => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ r, paso: actual }));
    } catch {
      /* Sin almacenamiento (modo privado estricto): el ejercicio funciona igual, solo en memoria. */
    }
  };
  const borrar = () => {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* nada */
    }
  };
  const limpiarTemporizadores = () => {
    if (temporizador) window.clearInterval(temporizador);
    temporizador = null;
    respiracion.forEach((id) => window.clearTimeout(id));
    respiracion = [];
  };

  const dyn = (v: string | ((x: Respuestas) => string) | undefined) => (typeof v === 'function' ? v(r) : (v ?? ''));
  const texto = (id: string) => (typeof r[id] === 'string' ? (r[id] as string) : '');
  const lista = (id: string) => (Array.isArray(r[id]) ? (r[id] as string[]) : []);

  /** Frases de un texto escrito antes, para el paso «marcar». */
  const frasesDe = (s: string) => {
    const out: string[] = [];
    s.split(/\n+/).forEach((linea) => {
      const partes = linea.match(/[^.!?…]+[.!?…]*/g) ?? [];
      partes.forEach((p) => {
        const f = p.trim();
        if (f.length > 1) out.push(f);
      });
    });
    return out.length ? out : [s.trim()].filter(Boolean);
  };

  const completo = (p: Paso): boolean => {
    const v = r[p.id];
    switch (p.tipo) {
      case 'nota':
      case 'pausa':
        return true;
      case 'texto':
        return typeof v === 'string' && v.trim().length >= p.min;
      case 'opciones':
        if (p.multiple) return Array.isArray(v) && v.length >= (p.min ?? 1);
        return typeof v === 'string' && v.trim().length > 0;
      case 'escala':
        return typeof v === 'number';
      case 'dominios':
        return (
          !!v &&
          typeof v === 'object' &&
          p.dominios.every((dm) => typeof (v as Record<string, unknown>)[dm.id] === 'number')
        );
      case 'marcar':
        return typeof v === 'string' && v.trim().length > 0;
    }
  };

  /* ---------- Piezas comunes ---------- */
  const cabecera = (i: number) => {
    const pct = Math.round((i / total) * 100);
    return `
      <div class="ev__progress" role="progressbar" aria-label="Progreso" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${i}">
        <span class="ev__progress-bar" style="width:${pct}%"></span>
      </div>
      <p class="ev__count eyebrow">Paso ${i + 1} de ${total}</p>`;
  };
  const navegacion = (i: number, p: Paso, etiqueta?: string) => `
      <div class="ev__nav">
        <button type="button" class="ev__back" data-back ${i === 0 ? 'hidden' : ''}>← Atrás</button>
        <button type="button" class="btn btn--primary ev__next" data-next ${completo(p) ? '' : 'disabled'}>${
          etiqueta ?? (i === total - 1 ? 'Ver mi resumen' : 'Siguiente')
        }</button>
      </div>`;

  const engancharNav = (i: number) => {
    const next = stage.querySelector<HTMLButtonElement>('[data-next]')!;
    const back = stage.querySelector<HTMLButtonElement>('[data-back]');
    next.addEventListener('click', () => avanzar(i));
    back?.addEventListener('click', () => paso(i - 1));
    return next;
  };
  const avanzar = (i: number) => {
    if (!completo(ej.pasos[i])) return;
    if (i + 1 < total) paso(i + 1);
    else finalizar();
  };

  /* ---------- Paso ---------- */
  const paso = (i: number) => {
    limpiarTemporizadores();
    actual = i;
    guardar();
    const p = ej.pasos[i];
    switch (p.tipo) {
      case 'nota':
        return nota(i, p);
      case 'pausa':
        return pausa(i, p);
      case 'texto':
        return escritura(i, p);
      case 'opciones':
        return opciones(i, p);
      case 'escala':
        return escala(i, p);
      case 'dominios':
        return dominios(i, p);
      case 'marcar':
        return marcar(i, p);
    }
  };

  const nota = (i: number, p: Extract<Paso, { tipo: 'nota' }>) => {
    render(
      `
      ${cabecera(i)}
      <div class="ej__lectura">
        <h2 class="ev__question" tabindex="-1" data-focus>${esc(dyn(p.titulo))}</h2>
        <p class="ej__lectura-texto">${esc(p.texto)}</p>
      </div>
      ${navegacion(i, p, 'Continuar')}`,
      () => {
        anunciar(`${dyn(p.titulo)} ${p.texto}`);
        engancharNav(i);
      },
    );
  };

  const pausa = (i: number, p: Extract<Paso, { tipo: 'pausa' }>) => {
    render(
      `
      ${cabecera(i)}
      <div class="ej__lectura">
        <h2 class="ev__question" tabindex="-1" data-focus>${esc(dyn(p.titulo))}</h2>
        <p class="ej__lectura-texto">${esc(p.texto)}</p>
        ${
          p.respiracion
            ? reduced
              ? `<p class="ej__breath-static small">Inhala contando hasta cuatro y exhala contando hasta seis. Repite tres veces.</p>`
              : `<div class="ej__breath" data-breath>
                  <span class="ej__breath-circle" aria-hidden="true"></span>
                  <span class="ej__breath-label" data-breath-label aria-live="polite">Inhala</span>
                </div>
                <p class="ej__breath-count small muted" data-breath-count>Respiración 1 de 3</p>`
            : ''
        }
      </div>
      ${navegacion(i, p, 'Continuar')}`,
      () => {
        anunciar(`${dyn(p.titulo)} ${p.texto}`);
        engancharNav(i);
        const label = stage.querySelector<HTMLElement>('[data-breath-label]');
        const count = stage.querySelector<HTMLElement>('[data-breath-count]');
        const wrap = stage.querySelector<HTMLElement>('[data-breath]');
        if (!label || !count || !wrap) return;
        /* Tres ciclos: 4 s inhalando, 6 s exhalando, acompasados con la animación del círculo (10 s). */
        for (let c = 0; c < 3; c++) {
          respiracion.push(
            window.setTimeout(() => {
              label.textContent = 'Inhala';
              count.textContent = `Respiración ${c + 1} de 3`;
            }, c * 10000),
          );
          respiracion.push(window.setTimeout(() => (label.textContent = 'Exhala'), c * 10000 + 4000));
        }
        respiracion.push(
          window.setTimeout(() => {
            wrap.classList.add('is-done');
            label.textContent = 'Listo';
            count.textContent = 'Cuando quieras, puedes continuar.';
          }, 30000),
        );
      },
    );
  };

  const escritura = (i: number, p: Extract<Paso, { tipo: 'texto' }>) => {
    const valor = texto(p.id);
    const seg = (p.minutos ?? 0) * 60;
    const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    render(
      `
      ${cabecera(i)}
      <div class="ej__escritura">
        <label class="ev__question ej__pregunta" for="ej-texto" tabindex="-1" data-focus>${esc(dyn(p.titulo))}</label>
        ${p.guia ? `<p class="ev__hint small muted">${esc(dyn(p.guia))}</p>` : ''}
        ${
          seg
            ? `<div class="ej__timer" data-timer aria-live="off">
                <span class="ej__timer-text" data-timer-text>${mmss(seg)}</span>
                <span class="ej__timer-bar" aria-hidden="true"><span class="ej__timer-fill" data-timer-fill></span></span>
                <span class="ej__timer-note small muted" data-timer-note>El tiempo comienza con tu primera palabra. Intenta escribir de forma continua hasta que termine.</span>
              </div>`
            : ''
        }
        <textarea id="ej-texto" class="ej__textarea" rows="${p.filas ?? 5}" ${p.placeholder ? `placeholder="${esc(p.placeholder)}"` : ''} autocomplete="off" spellcheck="false">${esc(valor)}</textarea>
        <p class="ej__contador small muted" data-contador aria-live="polite"></p>
        ${
          p.ayudas?.length
            ? `<div class="ej__ayudas">
                <span class="ej__ayudas-label small muted">Si necesitas una idea para empezar:</span>
                ${p.ayudas.map((a) => `<button type="button" class="ej__ayuda" data-ayuda="${esc(a)}">${esc(a)}</button>`).join('')}
              </div>`
            : ''
        }
      </div>
      ${navegacion(i, p)}`,
      () => {
        anunciar(`Paso ${i + 1} de ${total}. ${dyn(p.titulo)}`);
        const next = engancharNav(i);
        const ta = stage.querySelector<HTMLTextAreaElement>('#ej-texto')!;
        const contador = stage.querySelector<HTMLElement>('[data-contador]')!;
        let tocado = valor.length > 0;

        const ajustar = () => {
          ta.style.height = 'auto';
          ta.style.height = `${Math.max(ta.scrollHeight, 0)}px`;
        };
        const actualizar = () => {
          const v = ta.value;
          r[p.id] = v;
          guardar();
          const ok = v.trim().length >= p.min;
          next.disabled = !ok;
          const palabras = v.trim() ? v.trim().split(/\s+/).length : 0;
          contador.textContent = !tocado
            ? ''
            : ok
              ? `${palabras} ${palabras === 1 ? 'palabra' : 'palabras'}. Puedes seguir escribiendo o continuar.`
              : `${palabras} ${palabras === 1 ? 'palabra' : 'palabras'}. Escribe un poco más para continuar.`;
        };
        ta.addEventListener('input', () => {
          tocado = true;
          ajustar();
          actualizar();
        });
        ajustar();
        actualizar();
        if (puntero) ta.focus({ preventScroll: true });

        stage.querySelectorAll<HTMLButtonElement>('[data-ayuda]').forEach((b) => {
          b.addEventListener('click', () => {
            const frase = b.dataset.ayuda ?? '';
            const sep = ta.value && !ta.value.endsWith('\n') ? '\n' : '';
            ta.value = `${ta.value}${sep}${frase} `;
            tocado = true;
            ajustar();
            actualizar();
            ta.focus();
            ta.setSelectionRange(ta.value.length, ta.value.length);
          });
        });

        if (seg) {
          const txt = stage.querySelector<HTMLElement>('[data-timer-text]')!;
          const fill = stage.querySelector<HTMLElement>('[data-timer-fill]')!;
          const note = stage.querySelector<HTMLElement>('[data-timer-note]')!;
          let restante = seg;
          const pintar = () => {
            txt.textContent = mmss(restante);
            fill.style.width = `${((seg - restante) / seg) * 100}%`;
          };
          pintar();
          /* El reloj arranca con la primera palabra, no al abrir la pantalla: primero se lee la consigna. */
          const arrancar = () => {
            if (temporizador) return;
            note.textContent = 'Intenta escribir de forma continua hasta que termine el tiempo.';
            temporizador = window.setInterval(() => {
              restante = Math.max(0, restante - 1);
              pintar();
              if (restante === 0) {
                limpiarTemporizadores();
                note.textContent = 'Se cumplió el tiempo sugerido. Puedes seguir escribiendo o continuar.';
                anunciar('Se cumplió el tiempo sugerido. Puedes seguir escribiendo o continuar.');
              }
            }, 1000);
          };
          if (valor.trim()) arrancar();
          else ta.addEventListener('input', arrancar, { once: true });
        }
      },
    );
  };

  const OTRA = '__otra__';

  const opciones = (i: number, p: Extract<Paso, { tipo: 'opciones' }>) => {
    const base = p.desde ? lista(p.desde) : (p.opciones ?? []);
    const multiple = !!p.multiple;
    const elegidas = multiple ? lista(p.id) : texto(p.id) ? [texto(p.id)] : [];
    const propias = elegidas.filter((e) => !base.includes(e));
    const otraTexto = propias[0] ?? '';
    const tipo = multiple ? 'checkbox' : 'radio';
    const items = [...base.map((o) => ({ v: o, l: o })), ...(p.otra ? [{ v: OTRA, l: 'Otra cosa…' }] : [])]
      .map(
        (o, k) => `
        <li>
          <input class="ev__radio" type="${tipo}" name="p${i}" id="p${i}-${k}" value="${esc(o.v)}" ${
            o.v === OTRA ? (otraTexto ? 'checked' : '') : elegidas.includes(o.v) ? 'checked' : ''
          } />
          <label class="ev__opcion ej__opcion" for="p${i}-${k}">${esc(o.l)}</label>
        </li>`,
      )
      .join('');
    const guiaMax = multiple && p.max ? `Puedes elegir hasta ${p.max}.` : '';
    render(
      `
      ${cabecera(i)}
      <fieldset class="ev__fieldset">
        <legend class="ev__question" tabindex="-1" data-focus>${esc(dyn(p.titulo))}</legend>
        ${p.guia || guiaMax ? `<p class="ev__hint ej__hint small muted">${esc(dyn(p.guia))} ${guiaMax}</p>` : ''}
        <ul class="ev__opciones ej__opciones ${base.length >= 8 ? 'ej__opciones--2' : ''}" role="list">${items}</ul>
        ${
          p.otra
            ? `<div class="ej__otra" data-otra ${otraTexto ? '' : 'hidden'}>
                <label class="small" for="ej-otra">Escríbela con tus palabras</label>
                <input id="ej-otra" type="text" class="ej__input" value="${esc(otraTexto)}" autocomplete="off" />
              </div>`
            : ''
        }
      </fieldset>
      ${navegacion(i, p)}`,
      () => {
        anunciar(`Paso ${i + 1} de ${total}. ${dyn(p.titulo)}`);
        const next = engancharNav(i);
        const inputs = [...stage.querySelectorAll<HTMLInputElement>('.ev__radio')];
        const otraWrap = stage.querySelector<HTMLElement>('[data-otra]');
        const otraInput = stage.querySelector<HTMLInputElement>('#ej-otra');

        const leer = () => {
          const marcadas = inputs.filter((x) => x.checked).map((x) => x.value);
          const conOtra = marcadas.map((v) => (v === OTRA ? (otraInput?.value.trim() ?? '') : v)).filter(Boolean);
          if (multiple) r[p.id] = conOtra;
          else r[p.id] = conOtra[0] ?? '';
          if (otraWrap) otraWrap.hidden = !marcadas.includes(OTRA);
          if (multiple && p.max) {
            const llenas = marcadas.length >= p.max;
            inputs.forEach((x) => (x.disabled = llenas && !x.checked));
          }
          guardar();
          next.disabled = !completo(p);
        };
        stage.querySelectorAll<HTMLLabelElement>('.ev__opcion').forEach((l) => {
          l.addEventListener('pointerdown', () => (viaPuntero = true));
        });
        inputs.forEach((x) => {
          x.addEventListener('change', () => {
            leer();
            if (x.checked && x.value === OTRA) {
              viaPuntero = false;
              otraInput?.focus();
              return;
            }
            /* Selección única con el dedo o el ratón: avanza sola tras una pausa breve. Con teclado, se confirma. */
            if (!multiple && viaPuntero) {
              viaPuntero = false;
              window.setTimeout(
                () => {
                  if (x.checked && stage.contains(x)) avanzar(i);
                },
                reduced ? 0 : 260,
              );
            }
          });
        });
        otraInput?.addEventListener('input', leer);
        leer();
      },
    );
  };

  const escala = (i: number, p: Extract<Paso, { tipo: 'escala' }>) => {
    const v = typeof r[p.id] === 'number' ? (r[p.id] as number) : null;
    const items = Array.from({ length: 11 }, (_, k) => k)
      .map(
        (k) => `
        <li>
          <input class="ev__radio" type="radio" name="e${i}" id="e${i}-${k}" value="${k}" ${v === k ? 'checked' : ''} />
          <label class="ej__grado" for="e${i}-${k}">${k}</label>
        </li>`,
      )
      .join('');
    render(
      `
      ${cabecera(i)}
      <fieldset class="ev__fieldset">
        <legend class="ev__question" tabindex="-1" data-focus>${esc(dyn(p.titulo))}</legend>
        ${p.guia ? `<p class="ev__hint ej__hint small muted">${esc(dyn(p.guia))}</p>` : ''}
        <div class="ej__escala">
          <ul class="ej__grados" role="list">${items}</ul>
          <div class="ej__escala-etq small muted" aria-hidden="true"><span>${esc(p.etiquetas[0])}</span><span>${esc(p.etiquetas[1])}</span></div>
        </div>
      </fieldset>
      ${navegacion(i, p)}`,
      () => {
        anunciar(`Paso ${i + 1} de ${total}. ${dyn(p.titulo)} De 0, ${p.etiquetas[0]}, a 10, ${p.etiquetas[1]}.`);
        const next = engancharNav(i);
        stage.querySelectorAll<HTMLLabelElement>('.ej__grado').forEach((l) => {
          l.addEventListener('pointerdown', () => (viaPuntero = true));
        });
        stage.querySelectorAll<HTMLInputElement>('.ev__radio').forEach((x) => {
          x.addEventListener('change', () => {
            r[p.id] = Number(x.value);
            guardar();
            next.disabled = false;
            if (viaPuntero) {
              viaPuntero = false;
              window.setTimeout(
                () => {
                  if (x.checked && stage.contains(x)) avanzar(i);
                },
                reduced ? 0 : 320,
              );
            }
          });
        });
      },
    );
  };

  const dominios = (i: number, p: Extract<Paso, { tipo: 'dominios' }>) => {
    const guardado = (r[p.id] && typeof r[p.id] === 'object' ? r[p.id] : {}) as Record<string, number>;
    const tocados = new Set(Object.keys(guardado));
    const filas = p.dominios
      .map(
        (dm) => `
        <li class="ej__dominio">
          <div class="ej__dominio-txt">
            <label for="d-${dm.id}" class="ej__dominio-nombre">${esc(dm.nombre)}</label>
            <span class="ej__dominio-desc small muted">${esc(dm.descripcion)}</span>
          </div>
          <div class="ej__dominio-ctl">
            <input id="d-${dm.id}" type="range" min="0" max="10" step="1" value="${guardado[dm.id] ?? 5}" data-dominio="${dm.id}" class="ej__range ${tocados.has(dm.id) ? 'is-set' : ''}" aria-describedby="d-${dm.id}-v" />
            <output id="d-${dm.id}-v" class="ej__range-val" for="d-${dm.id}">${tocados.has(dm.id) ? guardado[dm.id] : '–'}</output>
          </div>
        </li>`,
      )
      .join('');
    render(
      `
      ${cabecera(i)}
      <fieldset class="ev__fieldset">
        <legend class="ev__question" tabindex="-1" data-focus>${esc(dyn(p.titulo))}</legend>
        ${p.guia ? `<p class="ev__hint ej__hint small muted">${esc(dyn(p.guia))}</p>` : ''}
        <ul class="ej__dominios" role="list">${filas}</ul>
        <p class="ej__contador small muted" data-faltan aria-live="polite"></p>
      </fieldset>
      ${navegacion(i, p)}`,
      () => {
        anunciar(`Paso ${i + 1} de ${total}. ${dyn(p.titulo)}`);
        const next = engancharNav(i);
        const faltan = stage.querySelector<HTMLElement>('[data-faltan]')!;
        const valores: Record<string, number> = { ...guardado };
        const refrescar = () => {
          r[p.id] = { ...valores };
          guardar();
          const n = p.dominios.length - Object.keys(valores).length;
          faltan.textContent =
            n > 0
              ? `Mueve cada barra, aunque sea un poco. ${n === 1 ? 'Falta una área' : `Faltan ${n} áreas`}.`
              : 'Listo. Puedes continuar.';
          next.disabled = n > 0;
        };
        stage.querySelectorAll<HTMLInputElement>('[data-dominio]').forEach((range) => {
          const out = stage.querySelector<HTMLOutputElement>(`#${range.id}-v`)!;
          const pintar = () => range.style.setProperty('--p', `${(Number(range.value) / 10) * 100}%`);
          const marcar = () => {
            valores[range.dataset.dominio!] = Number(range.value);
            out.textContent = range.value;
            range.classList.add('is-set');
            pintar();
            refrescar();
          };
          pintar();
          range.addEventListener('input', marcar);
          /* Un toque sin mover (vale el valor que ya muestra) también cuenta como respuesta. */
          range.addEventListener('change', marcar);
          range.addEventListener('keyup', marcar);
          range.addEventListener('pointerup', marcar);
        });
        refrescar();
      },
    );
  };

  const marcar = (i: number, p: Extract<Paso, { tipo: 'marcar' }>) => {
    const frases = frasesDe(texto(p.de));
    const elegida = texto(p.id);
    const items = frases
      .map(
        (f, k) => `
        <li>
          <button type="button" class="ej__frase-btn" data-frase="${k}" aria-pressed="${f === elegida ? 'true' : 'false'}">${esc(f)}</button>
        </li>`,
      )
      .join('');
    render(
      `
      ${cabecera(i)}
      <div class="ej__marcar">
        <h2 class="ev__question" tabindex="-1" data-focus>${esc(dyn(p.titulo))}</h2>
        ${p.guia ? `<p class="ev__hint small muted">${esc(dyn(p.guia))}</p>` : ''}
        <ul class="ej__frases" role="list">${items}</ul>
      </div>
      ${navegacion(i, p)}`,
      () => {
        anunciar(`Paso ${i + 1} de ${total}. ${dyn(p.titulo)}`);
        const next = engancharNav(i);
        const botones = [...stage.querySelectorAll<HTMLButtonElement>('[data-frase]')];
        botones.forEach((b) => {
          b.addEventListener('click', () => {
            botones.forEach((x) => x.setAttribute('aria-pressed', 'false'));
            b.setAttribute('aria-pressed', 'true');
            r[p.id] = frases[Number(b.dataset.frase)];
            guardar();
            next.disabled = false;
          });
        });
      },
    );
  };

  /* ---------- Fin de los pasos ---------- */
  const finalizar = () => {
    limpiarTemporizadores();
    if (cfg.leadsEndpoint) datos();
    else reflejo({ enviado: null });
  };

  const datos = () => {
    pasoDatos({
      stage,
      render,
      anunciar,
      inicio,
      endpoint: cfg.leadsEndpoint,
      privacidadHref: cfg.privacidadHref,
      textos: {
        eyebrow: 'Último paso',
        titulo: 'Tu resumen está listo.',
        texto:
          'Si lo deseas, deja tu nombre y tu contacto para que la Dra. Acevedo pueda darte seguimiento. Nada de lo que escribiste sale de tu dispositivo: solo se registra qué ejercicio hiciste y la fecha.',
        consentimiento:
          'Autorizo a Growing Souls a recibir mi nombre y mi contacto, junto con el nombre de este ejercicio y la fecha, para poder darme seguimiento.',
        boton: 'Ver mi resumen',
        saltar: 'Prefiero verlo sin dejar mis datos',
        privacidad: cfg.textos.privacidad,
      },
      construirPayload: (c) => {
        const payload: EjercicioPayload = {
          source: 'ejercicio',
          ejercicio_id: ej.id,
          ejercicio: ej.titulo,
          fecha: new Date().toISOString(),
          nombre: c.nombre,
          email: c.email,
          telefono: c.telefono,
          consentimiento_seguimiento: true,
          consentimiento_comunicaciones: c.comunicaciones,
          pagina: location.href.split('?')[0],
          idioma: 'es-PR',
        };
        return payload;
      },
      alTerminar: reflejo,
    });
  };

  /* ---------- Reflejo ---------- */
  const bloqueHtml = (b: Bloque): string => {
    switch (b.tipo) {
      case 'titulo':
        return `${b.eyebrow ? `<p class="eyebrow">${esc(b.eyebrow)} · ${esc(ej.titulo)}</p>` : ''}
          <h2 class="ev__result-title" id="ej-result-title" tabindex="-1" data-focus>${esc(b.texto)}</h2>`;
      case 'frase':
        if (!b.texto.trim()) return '';
        return `<figure class="ej__frase ${b.destacada ? 'ej__frase--destacada' : ''}">
          ${b.etiqueta ? `<figcaption class="ej__etiqueta">${esc(b.etiqueta)}</figcaption>` : ''}
          <blockquote>${escMultilinea(b.texto)}</blockquote>
        </figure>`;
      case 'parrafo':
        return b.texto.trim() ? `<p class="ej__p">${esc(b.texto)}</p>` : '';
      case 'citas':
        return `<div class="ej__citas">${b.items
          .filter((c) => c.texto.trim())
          .map(
            (c) => `<figure class="ej__cita">
              <figcaption class="ej__etiqueta">${esc(c.etiqueta)}</figcaption>
              <blockquote>${escMultilinea(c.texto)}</blockquote>
            </figure>`,
          )
          .join('')}</div>`;
      case 'columnas':
        return `<div class="ej__cols">
          <div class="ej__col"><h3 class="ej__etiqueta">${esc(b.izquierda.titulo)}</h3><p>${escMultilinea(b.izquierda.texto)}</p></div>
          <div class="ej__col"><h3 class="ej__etiqueta">${esc(b.derecha.titulo)}</h3><p>${escMultilinea(b.derecha.texto)}</p></div>
        </div>`;
      case 'chips':
        if (!b.items.length) return '';
        return `<div class="ej__chips">
          <p class="ej__etiqueta">${esc(b.etiqueta)}</p>
          <ul role="list">${b.items.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
        </div>`;
      case 'medida': {
        const pct = Math.max(0, Math.min(100, (b.valor / b.max) * 100));
        return `<div class="ej__medida">
          <p class="ej__etiqueta">${esc(b.etiqueta)}</p>
          <p class="ej__medida-num"><span class="ej__medida-big">${b.valor}</span> <span class="ej__medida-max">de ${b.max}</span></p>
          <div class="ej__medida-bar" aria-hidden="true"><span style="width:${pct}%"></span></div>
          ${b.texto ? `<p class="ej__medida-txt">${esc(b.texto)}</p>` : ''}
        </div>`;
      }
      case 'barras':
        return `<div class="ej__barras">
          <div class="ej__leyenda small" aria-hidden="true">
            <span class="ej__leg ej__leg--a">${esc(b.series[0])}</span>
            <span class="ej__leg ej__leg--b">${esc(b.series[1])}</span>
          </div>
          <ul class="ej__barras-list" role="list">${b.items
            .map(
              (it) => `<li class="ej__barra-row">
                <span class="ej__barra-nombre">${esc(it.nombre)}</span>
                <span class="ej__barra-pair">
                  <span class="ej__barra ej__barra--a" style="width:${(it.a / b.max) * 100}%"><i>${it.a}</i></span>
                  <span class="ej__barra ej__barra--b" style="width:${(it.b / b.max) * 100}%"><i>${it.b}</i></span>
                </span>
                <span class="visually-hidden">${esc(b.series[0])} ${it.a} de ${b.max}, ${esc(b.series[1])} ${it.b} de ${b.max}.</span>
              </li>`,
            )
            .join('')}</ul>
        </div>`;
      case 'ciclo':
        return `<ol class="ej__ciclo" role="list">${b.pasos
          .map(
            (s) => `<li class="ej__ciclo-paso">
              <span class="ej__etiqueta">${esc(s.etiqueta)}</span>
              <span class="ej__ciclo-txt">${esc(s.texto)}</span>
            </li>`,
          )
          .join('')}
          <li class="ej__ciclo-vuelta" aria-label="y vuelve a empezar">y vuelve a empezar</li>
        </ol>`;
      case 'carta': {
        const cuerpo = `<div class="ej__carta">
          ${b.fecha ? `<p class="ej__carta-fecha small muted">${esc(b.fecha)}</p>` : ''}
          ${b.titulo ? `<p class="ej__carta-titulo">${esc(b.titulo)}</p>` : ''}
          <div class="ej__carta-texto">${escMultilinea(b.texto)}</div>
          ${b.firma ? `<p class="ej__carta-firma">${esc(b.firma)}</p>` : ''}
        </div>`;
        return b.plegada
          ? `<details class="ej__details"><summary class="ej__summary">Volver a leer tu carta completa</summary>${cuerpo}</details>`
          : cuerpo;
      }
      case 'aviso':
        return `<p class="ej__aviso">${esc(b.texto)}</p>`;
      case 'cierre':
        return `<p class="ej__cierre">${esc(b.texto)}</p>`;
    }
  };

  const reflejo = ({ enviado, nombre }: { enviado: Enviado; nombre?: string }) => {
    limpiarTemporizadores();
    const bloques = ej.reflejo(r);
    const saludo = nombre ? `<p class="ej__saludo">${esc(nombre.split(' ')[0])}, esto es lo que escribiste.</p>` : '';
    render(
      `
      <article class="ev__result ej__result" aria-labelledby="ej-result-title">
        ${saludo}
        ${bloques.map(bloqueHtml).join('')}
        <div class="ev__callout ev__callout--soft">
          <p>Si deseas profundizar en esto con acompañamiento profesional, puedes solicitar una cita. También puedes traer este resumen a tu primera sesión.</p>
          <div class="ev__nav ev__nav--center">
            <a class="btn btn--primary" href="${esc(cfg.citaHref)}">Solicitar una cita</a>
            <a class="btn btn--secondary" href="${esc(ej.servicio.href)}">${esc(ej.servicio.label)}</a>
          </div>
        </div>
        <div class="ej__crisis small" role="note">
          <p>Si este ejercicio despertó emociones difíciles de manejar, no tienes que atravesarlas a solas. Hay ayuda inmediata, gratuita y en español, a cualquier hora:</p>
          <ul class="ev__crisis ev__crisis--compacta" role="list">${crisisHtml(cfg.crisis)}</ul>
        </div>
        ${
          enviado === 'error'
            ? `<p class="ev__note small">No pudimos registrar tus datos en este momento. Tu resumen está disponible de todos modos; si deseas seguimiento, escríbenos por <a href="${esc(cfg.whatsappHref)}" rel="noopener">WhatsApp</a>.</p>`
            : enviado === 'demo'
              ? `<p class="ev__note small">Vista previa: el envío de datos está simulado.</p>`
              : ''
        }
        <p class="ev__source small muted">${esc(ej.enfoque)} Fuentes: ${ej.fuentes.map((f) => esc(f.nombre)).join('; ')}. Intensidad: ${esc(intensidades[ej.intensidad].etiqueta.toLowerCase())}.</p>
        <p class="ev__note small muted">${esc(cfg.textos.privacidad)} ${esc(cfg.textos.dispositivo)}</p>
        <p class="ev__again small">
          <a href="${esc(cfg.indiceHref)}">Ver otros ejercicios</a> · <button type="button" class="ev__link" data-print>Imprimir o guardar en PDF</button> · <button type="button" class="ev__link" data-borrar>Borrar lo que escribí</button>
        </p>
        <p class="ej__borrado small" data-borrado hidden>Borrado. Nada de lo que escribiste queda en este dispositivo.</p>
      </article>
    `,
      () => {
        anunciar('Tu resumen está listo.');
        stage.querySelector<HTMLButtonElement>('[data-print]')?.addEventListener('click', () => {
          stage.querySelectorAll<HTMLDetailsElement>('details').forEach((d) => (d.open = true));
          window.print();
        });
        const borrarBtn = stage.querySelector<HTMLButtonElement>('[data-borrar]');
        let confirmando = false;
        borrarBtn?.addEventListener('click', () => {
          if (!confirmando) {
            confirmando = true;
            borrarBtn.textContent = '¿Seguro? Sí, borrar';
            return;
          }
          borrar();
          r = {};
          actual = 0;
          stage
            .querySelectorAll<HTMLElement>(
              '.ej__frase, .ej__citas, .ej__cols, .ej__chips, .ej__medida, .ej__barras, .ej__ciclo, .ej__carta, .ej__details, .ej__saludo',
            )
            .forEach((el) => el.remove());
          borrarBtn.remove();
          const aviso = stage.querySelector<HTMLElement>('[data-borrado]');
          if (aviso) aviso.hidden = false;
          anunciar('Borrado. Nada de lo que escribiste queda en este dispositivo.');
        });
      },
    );
  };

  /* ---------- Inicio ---------- */
  const hayBorrador = leerBorrador();
  const avisoBorrador = root.querySelector<HTMLElement>('[data-borrador]');
  if (avisoBorrador && hayBorrador) avisoBorrador.hidden = false;

  root.querySelector<HTMLButtonElement>('[data-start-wrap] .btn')?.addEventListener('click', () => {
    intro.hidden = true;
    stage.hidden = false;
    paso(hayBorrador ? actual : 0);
  });
  root.querySelector<HTMLButtonElement>('[data-reiniciar]')?.addEventListener('click', () => {
    borrar();
    r = {};
    actual = 0;
    if (avisoBorrador) avisoBorrador.hidden = true;
  });
}
