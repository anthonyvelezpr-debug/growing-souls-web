/**
 * Paso de datos compartido: nombre, correo y teléfono con dos consentimientos separados, antes de mostrar el
 * resultado de una autoevaluación o el reflejo de un ejercicio. Solo existe si hay un destino configurado.
 *
 * Quien lo usa decide qué carga útil construir (nunca respuestas ni textos escritos) y qué hacer después.
 */
import { enviarLead, normalizarTelefono, validar, type Payload } from '../lib/leads';
import { esc } from './ui';

export type Enviado = 'ok' | 'demo' | 'error' | null;

export interface DatosTextos {
  eyebrow: string;
  titulo: string;
  texto: string;
  consentimiento: string;
  boton: string;
  privacidad: string;
  /** Si existe, se ofrece un enlace para ver el resultado sin dejar datos. */
  saltar?: string;
}

export interface DatosOpciones {
  stage: HTMLElement;
  render: (html: string, after: () => void) => void;
  anunciar: (msg: string) => void;
  /** Momento en que empezó la experiencia: respuestas imposiblemente rápidas no se envían. */
  inicio: number;
  endpoint: string;
  privacidadHref: string;
  textos: DatosTextos;
  construirPayload: (c: { nombre: string; email: string; telefono: string; comunicaciones: boolean }) => Payload;
  alTerminar: (res: { enviado: Enviado; nombre?: string }) => void;
}

export function pasoDatos(o: DatosOpciones) {
  const { stage, textos } = o;
  o.render(
    `
    <form class="ev__form" novalidate data-lead-form>
      <p class="eyebrow">${esc(textos.eyebrow)}</p>
      <h2 class="ev__form-title" tabindex="-1" data-focus>${esc(textos.titulo)}</h2>
      <p class="ev__form-text">${esc(textos.texto)}</p>
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
          <label for="ev-consent">${esc(textos.consentimiento)} He leído la <a href="${esc(o.privacidadHref)}" target="_blank" rel="noopener">política de privacidad</a>.</label>
          <p class="ev__error" id="ev-consent-error" hidden>Necesito tu autorización para registrar tus datos.</p>
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
        <button type="submit" class="btn btn--primary" data-submit>${esc(textos.boton)}</button>
      </div>
      ${textos.saltar ? `<p class="small"><button type="button" class="ev__link" data-skip>${esc(textos.saltar)}</button></p>` : ''}
      <p class="ev__privacy small muted">${esc(textos.privacidad)}</p>
    </form>
  `,
    () => {
      o.anunciar(`${textos.titulo} ${textos.texto}`);

      const form = stage.querySelector<HTMLFormElement>('[data-lead-form]')!;
      const showError = (id: string, show: boolean) => {
        const el = form.querySelector<HTMLElement>(`#${id}-error`);
        const input = form.querySelector<HTMLInputElement>(`#${id}`);
        if (el) el.hidden = !show;
        input?.setAttribute('aria-invalid', String(show));
      };
      form
        .querySelector<HTMLButtonElement>('[data-skip]')
        ?.addEventListener('click', () => o.alTerminar({ enviado: null }));
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
        if (hp || Date.now() - o.inicio < 3000) {
          o.alTerminar({ enviado: null });
          return;
        }

        const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
        submit.disabled = true;
        submit.textContent = 'Un momento…';

        const payload = o.construirPayload({
          nombre: nombre.trim(),
          email: email.trim().toLowerCase(),
          telefono: normalizarTelefono(telefono),
          comunicaciones: news,
        });
        /* El resultado nunca espera más de cuatro segundos por la red. */
        const envio = enviarLead(o.endpoint, payload);
        const tope = new Promise<'pendiente'>((r) => setTimeout(() => r('pendiente'), 4000));
        const estado = await Promise.race([envio, tope]);
        o.alTerminar({ enviado: estado === 'pendiente' ? 'ok' : estado, nombre: nombre.trim() });
      });
    },
  );
}
