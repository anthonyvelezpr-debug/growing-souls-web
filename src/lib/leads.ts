/**
 * Envío de contactos ("leads") de las autoevaluaciones a un endpoint externo (webhook de CRM, automatización, etc.).
 *
 * - Se usa en el navegador. No hay backend propio: el destino se configura con PUBLIC_LEADS_ENDPOINT en el build.
 * - Carga útil mínima: nombre, contacto, qué autoevaluación, fecha, puntuación total, rango y consentimientos.
 *   Nunca se envían las respuestas individuales.
 * - 'demo' simula un envío correcto sin red (vista previa interna).
 * - Si el endpoint no acepta CORS, se reintenta como petición opaca (no-cors, text/plain): no se puede leer la
 *   respuesta, pero el servidor la recibe. Cualquier fallo devuelve 'error' y la página muestra el resultado igual.
 */

export interface LeadPayload {
  source: 'autoevaluacion';
  evaluacion_id: string;
  evaluacion: string;
  instrumento: string;
  fecha: string;
  puntuacion: number;
  puntuacion_max: number;
  rango: string;
  nombre: string;
  email: string;
  telefono: string;
  consentimiento_seguimiento: true;
  consentimiento_comunicaciones: boolean;
  pagina: string;
  idioma: string;
}

export type LeadResultado = 'ok' | 'demo' | 'error';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function enviarLead(endpoint: string, payload: LeadPayload): Promise<LeadResultado> {
  if (!endpoint) return 'error';
  if (endpoint === 'demo') {
    await wait(600);
    return 'demo';
  }
  const body = JSON.stringify(payload);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });
    if (res.ok) return 'ok';
    if (res.type === 'opaque') return 'ok';
    return 'error';
  } catch {
    try {
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body,
        keepalive: true,
      });
      return 'ok';
    } catch {
      return 'error';
    }
  }
}

/** Validaciones compartidas del paso de datos. */
export const validar = {
  nombre: (v: string) => v.trim().length >= 2,
  email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
  /** Acepta 787-461-9260, (787) 461 9260, +1 787..., 7874619260. Mínimo 10 dígitos. */
  telefono: (v: string) => {
    const d = v.replace(/\D/g, '');
    return d.length >= 10 && d.length <= 15;
  },
};

export const normalizarTelefono = (v: string) => {
  const d = v.replace(/\D/g, '');
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith('1')) return `+${d}`;
  return v.trim();
};
