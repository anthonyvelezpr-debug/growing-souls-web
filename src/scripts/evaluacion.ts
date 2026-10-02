/**
 * Runner de una autoevaluación: una pregunta por pantalla, barra de progreso, paso de datos (si está configurado
 * un destino) y resultado. Todo en memoria: las respuestas no se guardan ni se envían.
 *
 * Estados: intro → pregunta(i) → [seguridad] → [datos] → resultado
 */
import type { Instrumento } from '../data/evaluaciones';
import type { LeadPayload } from '../lib/leads';
import { pasoDatos, type Enviado } from './datos-paso';
import { crearAnunciar, crearRender, crisisHtml, esc, type LineaCrisis } from './ui';

interface Config {
  instrumento: Instrumento;
  textos: {
    limitaciones: string;
    privacidad: string;
    seguridad: { titulo: string; texto: string; cierre: string };
  };
  crisis: LineaCrisis[];
  whatsappHref: string;
  citaHref: string;
  leadsEndpoint: string;
  privacidadHref: string;
  indiceHref: string;
}

const root = document.querySelector<HTMLElement>('[data-evaluacion]');
const dataEl = document.getElementById('evaluacion-data');

if (root && dataEl) {
  const cfg = JSON.parse(dataEl.textContent || '{}') as Config;
  const { instrumento: ins } = cfg;
  const total = ins.items.length;
  const respuestas: (number | null)[] = Array(total).fill(null);
  const stage = root.querySelector<HTMLElement>('[data-stage]')!;
  const intro = root.querySelector<HTMLElement>('[data-intro]')!;
  const live = root.querySelector<HTMLElement>('[data-live]')!;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const inicio = Date.now();
  let seguridadMostrada = false;
  let viaPuntero = false;

  const anunciar = crearAnunciar(live);
  const render = crearRender(root, stage);

  const puntuar = () => {
    const suma = respuestas.reduce<number>((a, b) => a + (b ?? 0), 0);
    return suma * ins.puntuacion.multiplicador;
  };
  const banda = (p: number) => ins.bandas.find((b) => p <= b.hasta) ?? ins.bandas[ins.bandas.length - 1];
  const hayRiesgo = () => ins.items.some((it, i) => it.seguridad && (respuestas[i] ?? 0) > 0);

  /* ---------- Pregunta ---------- */
  const pregunta = (i: number) => {
    const item = ins.items[i];
    const n = i + 1;
    const pct = Math.round((i / total) * 100);
    const opciones = ins.opciones
      .map(
        (o, k) => `
        <li>
          <input class="ev__radio" type="radio" name="q${i}" id="q${i}-${k}" value="${o.value}" ${respuestas[i] === o.value ? 'checked' : ''} />
          <label class="ev__opcion" for="q${i}-${k}">${esc(o.label)}</label>
        </li>`,
      )
      .join('');
    render(
      `
      <div class="ev__progress" role="progressbar" aria-label="Progreso" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${i}">
        <span class="ev__progress-bar" style="width:${pct}%"></span>
      </div>
      <p class="ev__count eyebrow">Pregunta ${n} de ${total}</p>
      <p class="ev__hint small muted">${i === 0 ? esc(ins.instruccion) : `Piensa en ${esc(ins.periodo)}.`}</p>
      <fieldset class="ev__fieldset">
        <legend class="ev__question" tabindex="-1" data-focus>${esc(item.texto)}</legend>
        <ul class="ev__opciones" role="list">${opciones}</ul>
      </fieldset>
      <div class="ev__nav">
        <button type="button" class="ev__back" data-back ${i === 0 ? 'hidden' : ''}>← Atrás</button>
        <button type="button" class="btn btn--primary ev__next" data-next ${respuestas[i] === null ? 'disabled' : ''}>${n === total ? 'Ver mi resultado' : 'Siguiente'}</button>
      </div>
    `,
      () => {
        anunciar(`Pregunta ${n} de ${total}. ${item.texto}`);

        const next = stage.querySelector<HTMLButtonElement>('[data-next]')!;
        const back = stage.querySelector<HTMLButtonElement>('[data-back]');
        const avanzar = () => {
          if (respuestas[i] === null) return;
          if (item.seguridad && (respuestas[i] ?? 0) > 0 && !seguridadMostrada) {
            seguridadMostrada = true;
            seguridad(i);
            return;
          }
          if (i + 1 < total) pregunta(i + 1);
          else finalizar();
        };
        stage.querySelectorAll<HTMLLabelElement>('.ev__opcion').forEach((l) => {
          l.addEventListener('pointerdown', () => (viaPuntero = true));
        });
        stage.querySelectorAll<HTMLInputElement>('.ev__radio').forEach((r) => {
          r.addEventListener('change', () => {
            respuestas[i] = Number(r.value);
            next.disabled = false;
            /* Con el dedo o el ratón, la selección avanza sola tras una pausa breve; con teclado, se confirma con Siguiente. */
            if (viaPuntero) {
              viaPuntero = false;
              window.setTimeout(
                () => {
                  if (respuestas[i] === Number(r.value) && stage.contains(r)) avanzar();
                },
                reduced ? 0 : 260,
              );
            }
          });
        });
        next.addEventListener('click', avanzar);
        back?.addEventListener('click', () => pregunta(i - 1));
      },
    );
  };

  /* ---------- Seguridad (ítem de ideas de muerte o de hacerse daño) ---------- */
  const seguridad = (i: number) => {
    render(
      `
      <div class="ev__safety" role="region" aria-labelledby="ev-safety-title">
        <p class="eyebrow">Un momento</p>
        <h2 class="ev__safety-title" id="ev-safety-title" tabindex="-1" data-focus>${esc(cfg.textos.seguridad.titulo)}</h2>
        <p class="ev__safety-text">${esc(cfg.textos.seguridad.texto)}</p>
        <ul class="ev__crisis" role="list">${crisisHtml(cfg.crisis)}</ul>
        <p class="ev__safety-close">${esc(cfg.textos.seguridad.cierre)}</p>
        <div class="ev__nav ev__nav--center">
          <a class="btn btn--secondary" href="/crisis/">Ver recursos de ayuda</a>
          <button type="button" class="btn btn--primary" data-continue>Continuar</button>
        </div>
      </div>
    `,
      () => {
        anunciar(cfg.textos.seguridad.titulo + ' ' + cfg.textos.seguridad.texto);
        stage.querySelector<HTMLButtonElement>('[data-continue]')?.addEventListener('click', () => {
          if (i + 1 < total) pregunta(i + 1);
          else finalizar();
        });
      },
    );
  };

  /* ---------- Fin del cuestionario ---------- */
  const finalizar = () => {
    if (cfg.leadsEndpoint && !hayRiesgo()) datos();
    else resultado({ enviado: null });
  };

  /* ---------- Paso de datos ---------- */
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
        titulo: 'Tu resultado está listo.',
        texto:
          'Déjame tu nombre y tu contacto para mostrarte el resultado completo y que Melanie pueda darte seguimiento si lo deseas. Solo se envía tu puntuación total y el rango: tus respuestas no salen de tu dispositivo.',
        consentimiento:
          'Autorizo a Growing Souls a recibir mi nombre, mi contacto y el resultado de esta autoevaluación para mostrármelo y poder darme seguimiento.',
        boton: 'Ver mi resultado',
        privacidad: cfg.textos.privacidad,
      },
      construirPayload: (c) => {
        const p = puntuar();
        const b = banda(p);
        const payload: LeadPayload = {
          source: 'autoevaluacion',
          evaluacion_id: ins.id,
          evaluacion: ins.titulo,
          instrumento: ins.fuente.nombre,
          fecha: new Date().toISOString(),
          puntuacion: p,
          puntuacion_max: ins.puntuacion.max,
          rango: b.etiqueta,
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
      alTerminar: resultado,
    });
  };

  /* ---------- Resultado ---------- */
  const resultado = ({ enviado, nombre }: { enviado: Enviado; nombre?: string }) => {
    const p = puntuar();
    const b = banda(p);
    const riesgo = hayRiesgo();
    const pct = Math.max(0, Math.min(100, Math.round((p / ins.puntuacion.max) * 100)));
    const segmentos = ins.bandas
      .map((bd, k) => {
        const prev = k === 0 ? 0 : ins.bandas[k - 1].hasta;
        const w = ((bd.hasta - prev) / ins.puntuacion.max) * 100;
        return `<span class="ev__seg ev__seg--${bd.nivel} ${bd === b ? 'is-current' : ''}" style="width:${w}%" title="${esc(bd.etiqueta)}"></span>`;
      })
      .join('');
    const saludo = nombre ? `${esc(nombre.split(' ')[0])}, ` : '';
    const titulo = nombre ? b.titulo.charAt(0).toLowerCase() + b.titulo.slice(1) : b.titulo;
    render(
      `
      <article class="ev__result" aria-labelledby="ev-result-title">
        ${
          riesgo
            ? `<div class="ev__safety ev__safety--result" role="region" aria-label="Ayuda inmediata">
                <p class="ev__safety-text"><strong>Antes que nada:</strong> una de tus respuestas habla de pensar en hacerte daño. Si eso está presente ahora, hay ayuda inmediata, gratuita y en español, a cualquier hora.</p>
                <ul class="ev__crisis" role="list">${crisisHtml(cfg.crisis)}</ul>
              </div>`
            : ''
        }
        <p class="eyebrow">Tu resultado · ${esc(ins.area)}</p>
        <h2 class="ev__result-title" id="ev-result-title" tabindex="-1" data-focus>${saludo}${esc(titulo)}</h2>
        <div class="ev__score ev__score--${b.nivel}">
          <p class="ev__score-num"><span class="ev__score-big">${p}</span> <span class="ev__score-max">${esc(ins.puntuacion.escala)}</span></p>
          <p class="ev__score-label">Rango según el instrumento: <strong>${esc(b.etiqueta)}</strong></p>
          <div class="ev__scale" aria-hidden="true">
            <div class="ev__segs">${segmentos}</div>
            <span class="ev__marker" style="left:${pct}%"></span>
          </div>
        </div>
        <div class="ev__block">
          <h3>Qué significa, en general</h3>
          <p>${esc(b.texto)}</p>
        </div>
        ${
          b.evaluar
            ? `<div class="ev__callout">
                <p><strong>Este resultado amerita una evaluación profesional más completa.</strong> No es un diagnóstico: es una señal de que vale la pena hablarlo con alguien preparado para escucharte.</p>
                <div class="ev__nav ev__nav--center">
                  <a class="btn btn--primary" href="${esc(cfg.citaHref)}">Solicitar una cita</a>
                  <a class="btn btn--secondary" href="${esc(cfg.whatsappHref)}" rel="noopener">Escribir por WhatsApp</a>
                </div>
              </div>`
            : ''
        }
        <div class="ev__block">
          <h3>Algunas ideas para cuidarte</h3>
          <ul class="ev__recs" role="list">${ins.recomendaciones.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
        </div>
        <div class="ev__block ev__block--limits">
          <h3>Lo que este resultado no puede decirte</h3>
          <p>${esc(cfg.textos.limitaciones)}</p>
        </div>
        ${
          !b.evaluar
            ? `<div class="ev__callout ev__callout--soft">
                <p>Si quieres hablar de lo que viste aquí, o de lo que no cabe en un cuestionario, aquí hay un espacio para escucharte.</p>
                <div class="ev__nav ev__nav--center">
                  <a class="btn btn--primary" href="${esc(cfg.citaHref)}">Solicitar una cita</a>
                  <a class="btn btn--secondary" href="${esc(ins.servicio.href)}">${esc(ins.servicio.label)}</a>
                </div>
              </div>`
            : ''
        }
        ${
          enviado === 'error'
            ? `<p class="ev__note small">No pudimos registrar tus datos en este momento. Tu resultado está aquí igual; si quieres seguimiento, escríbenos por <a href="${esc(cfg.whatsappHref)}" rel="noopener">WhatsApp</a>.</p>`
            : enviado === 'demo'
              ? `<p class="ev__note small">Vista previa: el envío de datos está simulado.</p>`
              : ''
        }
        <p class="ev__source small muted">
          Instrumento: ${esc(ins.fuente.nombre)}. ${esc(ins.fuente.autores.replace(/\.$/, ''))}. ${esc(ins.fuente.version)}. ${esc(ins.fuente.licencia)}
        </p>
        <p class="ev__again small">
          <a href="${esc(cfg.indiceHref)}">Ver otras autoevaluaciones</a> · <button type="button" class="ev__link" data-restart>Volver a empezar</button> · <button type="button" class="ev__link" data-print>Imprimir o guardar en PDF</button>
        </p>
      </article>
    `,
      () => {
        anunciar(`Resultado: ${b.titulo}`);
        stage.querySelector<HTMLButtonElement>('[data-restart]')?.addEventListener('click', () => {
          respuestas.fill(null);
          seguridadMostrada = false;
          pregunta(0);
        });
        /* Para llevar el resultado a una primera sesión: imprime solo el resultado (ver @media print). */
        stage.querySelector<HTMLButtonElement>('[data-print]')?.addEventListener('click', () => window.print());
      },
    );
  };

  /* ---------- Inicio ---------- */
  root.querySelector<HTMLButtonElement>('[data-start-wrap] .btn')?.addEventListener('click', () => {
    intro.hidden = true;
    stage.hidden = false;
    pregunta(0);
  });
}
