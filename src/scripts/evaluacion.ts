/**
 * Runner de una autoevaluación: una pregunta por pantalla, barra de progreso, paso de datos (si está configurado
 * un destino) y resultado. Todo en memoria: las respuestas no se guardan ni se envían.
 *
 * Estados: intro → pregunta(i) → [seguridad] → [datos] → resultado
 */
import type { Instrumento } from '../data/evaluaciones';
import { enviarLead, normalizarTelefono, validar, type LeadPayload } from '../lib/leads';

interface Config {
  instrumento: Instrumento;
  textos: {
    limitaciones: string;
    privacidad: string;
    seguridad: { titulo: string; texto: string; cierre: string };
  };
  crisis: { label: string; number: string; href: string }[];
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

  const esc = (s: string) =>
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

  const anunciar = (msg: string) => {
    live.textContent = '';
    window.setTimeout(() => (live.textContent = msg), 50);
  };

  /* Pinta la pantalla (con un fundido breve) y, ya en el DOM, ejecuta `after` para enganchar los eventos. */
  const render = (html: string, after: () => void, focusSel = '[data-focus]') => {
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
    const lineas = cfg.crisis
      .map(
        (l) => `
        <li class="ev__crisis-item">
          <a class="ev__crisis-number" href="${esc(l.href)}">${esc(l.number)}</a>
          <span class="ev__crisis-label small">${esc(l.label)}</span>
        </li>`,
      )
      .join('');
    render(
      `
      <div class="ev__safety" role="region" aria-labelledby="ev-safety-title">
        <p class="eyebrow">Un momento</p>
        <h2 class="ev__safety-title" id="ev-safety-title" tabindex="-1" data-focus>${esc(cfg.textos.seguridad.titulo)}</h2>
        <p class="ev__safety-text">${esc(cfg.textos.seguridad.texto)}</p>
        <ul class="ev__crisis" role="list">${lineas}</ul>
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
    render(
      `
      <form class="ev__form" novalidate data-lead-form>
        <p class="eyebrow">Último paso</p>
        <h2 class="ev__form-title" tabindex="-1" data-focus>Tu resultado está listo.</h2>
        <p class="ev__form-text">
          Déjame tu nombre y tu contacto para mostrarte el resultado completo y que Melanie pueda darte seguimiento si lo deseas.
          Solo se envía tu puntuación total y el rango: tus respuestas no salen de tu dispositivo.
        </p>
        <div class="ev__fields">
          <div class="ev__field">
            <label for="ev-nombre">Nombre</label>
            <input id="ev-nombre" name="nombre" type="text" autocomplete="name" required aria-describedby="ev-nombre-error" />
            <p class="ev__error" id="ev-nombre-error" hidden>Escribe tu nombre.</p>
          </div>
          <div class="ev__field">
            <label for="ev-email">Correo electrónico</label>
            <input id="ev-email" name="email" type="email" autocomplete="email" inputmode="email" required aria-describedby="ev-email-error" />
            <p class="ev__error" id="ev-email-error" hidden>Revisa el correo; parece incompleto.</p>
          </div>
          <div class="ev__field">
            <label for="ev-telefono">Teléfono</label>
            <input id="ev-telefono" name="telefono" type="tel" autocomplete="tel" inputmode="tel" required aria-describedby="ev-telefono-error" placeholder="787-000-0000" />
            <p class="ev__error" id="ev-telefono-error" hidden>Escribe un número de teléfono con al menos 10 dígitos.</p>
          </div>
          <div class="ev__check">
            <input id="ev-consent" name="consentimiento" type="checkbox" required aria-describedby="ev-consent-error" />
            <label for="ev-consent">Autorizo a Growing Souls a recibir mi nombre, mi contacto y el resultado de esta autoevaluación para mostrármelo y poder darme seguimiento. He leído la <a href="${esc(cfg.privacidadHref)}" target="_blank" rel="noopener">política de privacidad</a>.</label>
            <p class="ev__error" id="ev-consent-error" hidden>Necesito tu autorización para registrar el resultado.</p>
          </div>
          <div class="ev__check">
            <input id="ev-news" name="comunicaciones" type="checkbox" />
            <label for="ev-news">Quiero recibir recursos y novedades de Growing Souls por correo o WhatsApp. <span class="muted">(opcional)</span></label>
          </div>
          <div class="ev__hp" aria-hidden="true">
            <label for="ev-website">Deja este campo vacío</label>
            <input id="ev-website" name="website" type="text" tabindex="-1" autocomplete="off" />
          </div>
        </div>
        <div class="ev__nav ev__nav--center">
          <button type="submit" class="btn btn--primary" data-submit>Ver mi resultado</button>
        </div>
        <p class="ev__privacy small muted">${esc(cfg.textos.privacidad)}</p>
      </form>
    `,
      () => {
        anunciar('Último paso: deja tu nombre y tu contacto para ver el resultado.');

        const form = stage.querySelector<HTMLFormElement>('[data-lead-form]')!;
        const showError = (id: string, show: boolean) => {
          const el = form.querySelector<HTMLElement>(`#${id}-error`);
          const input = form.querySelector<HTMLInputElement>(`#${id}`);
          if (el) el.hidden = !show;
          input?.setAttribute('aria-invalid', String(show));
        };
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const nombre = form.querySelector<HTMLInputElement>('#ev-nombre')!.value;
          const email = form.querySelector<HTMLInputElement>('#ev-email')!.value;
          const telefono = form.querySelector<HTMLInputElement>('#ev-telefono')!.value;
          const consent = form.querySelector<HTMLInputElement>('#ev-consent')!.checked;
          const news = form.querySelector<HTMLInputElement>('#ev-news')!.checked;
          const hp = form.querySelector<HTMLInputElement>('#ev-website')!.value;

          const errores = {
            'ev-nombre': !validar.nombre(nombre),
            'ev-email': !validar.email(email),
            'ev-telefono': !validar.telefono(telefono),
            'ev-consent': !consent,
          };
          Object.entries(errores).forEach(([id, bad]) => showError(id, bad));
          if (Object.values(errores).some(Boolean)) {
            form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
            return;
          }
          /* Trampa para bots y respuestas imposiblemente rápidas: se muestra el resultado sin enviar nada. */
          if (hp || Date.now() - inicio < 3000) {
            resultado({ enviado: null });
            return;
          }

          const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
          submit.disabled = true;
          submit.textContent = 'Un momento…';

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
            nombre: nombre.trim(),
            email: email.trim().toLowerCase(),
            telefono: normalizarTelefono(telefono),
            consentimiento_seguimiento: true,
            consentimiento_comunicaciones: news,
            pagina: location.href.split('?')[0],
            idioma: 'es-PR',
          };
          /* El resultado nunca espera más de cuatro segundos por la red. */
          const envio = enviarLead(cfg.leadsEndpoint, payload);
          const tope = new Promise<'pendiente'>((r) => setTimeout(() => r('pendiente'), 4000));
          const estado = await Promise.race([envio, tope]);
          resultado({
            enviado: estado === 'pendiente' ? 'ok' : estado,
            nombre: nombre.trim(),
          });
        });
      },
    );
  };

  /* ---------- Resultado ---------- */
  const resultado = ({ enviado, nombre }: { enviado: 'ok' | 'demo' | 'error' | null; nombre?: string }) => {
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
    const lineas = cfg.crisis
      .map(
        (l) => `
        <li class="ev__crisis-item">
          <a class="ev__crisis-number" href="${esc(l.href)}">${esc(l.number)}</a>
          <span class="ev__crisis-label small">${esc(l.label)}</span>
        </li>`,
      )
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
                <ul class="ev__crisis" role="list">${lineas}</ul>
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
          Instrumento: ${esc(ins.fuente.nombre)}. ${esc(ins.fuente.autores.replace(/\.$/, ""))}. ${esc(ins.fuente.version)}. ${esc(ins.fuente.licencia)}
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
