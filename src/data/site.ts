// Datos del sitio. Todo lo marcado TODO VERIFICAR se confirma con Melanie antes del lanzamiento definitivo.

export const site = {
  name: 'Growing Souls',
  url: 'https://growingsoulspr.com',
  tagline: 'Un espacio seguro para sentir, comprender y crecer.',
  description:
    'Un espacio seguro para sentir, comprender y crecer. Psicoterapia individual y de pareja en Puerto Rico, presencial y en línea.',
  locale: 'es_PR',
  ogImage: '/images/og-growing-souls.jpg',

  person: {
    name: 'Dra. Melanie Acevedo Vélez, PsyD', // TODO VERIFICAR: forma canónica del nombre
    shortName: 'Dra. Melanie Acevedo',
    firstName: 'Melanie',
    jobTitle: 'Psicóloga Clínica',
    degree: 'PsyD',
  },

  location: {
    locality: '', // TODO VERIFICAR: oficina física (¿Isabela?) y dirección; vacío hasta confirmar
    region: 'PR',
    country: 'Puerto Rico',
    areaServed: 'Puerto Rico',
  },

  // Contacto (confirmado por Anthony, 30 sep 2026). El número es WhatsApp.
  contact: {
    email: 'support@growingsoulspr.com',
    instagram: 'growingsouls.pr',
    phone: '787-461-9260',
    whatsapp: '17874619260',
    whatsappText: 'Hola, me gustaría información para solicitar una cita.',
  },

  // Endpoint del formulario de cita (prompt 02). Vacío = modo mailto o aviso.
  formEndpoint: '',

  /**
   * Destino de los contactos: autoevaluaciones de "Conócete mejor" y formulario de cita. Se configura con la variable
   * PUBLIC_LEADS_ENDPOINT en el build (en GitHub: Settings → Secrets and variables → Actions → Variables).
   * Vacío = las autoevaluaciones muestran el resultado sin pedir datos y la cita abre el correo del visitante.
   * 'demo' = vista previa sin envío real.
   */
  leadsEndpoint: (import.meta.env.PUBLIC_LEADS_ENDPOINT ?? '').trim(),

  crisis: {
    intro:
      'Growing Souls no es un servicio de emergencias. Si estás en peligro o piensas en hacerte daño, comunícate ahora mismo con:',
    lines: [
      { label: 'Línea PAS (ASSMCA), 24 horas, 365 días', number: '1-800-981-0023', href: 'tel:18009810023' },
      { label: 'Línea 988', number: '988', href: 'tel:988' },
      { label: 'Emergencias', number: '911', href: 'tel:911' },
    ],
    source: 'https://lineapas.assmca.pr.gov/',
  },
} as const;

/** Enlace de WhatsApp (click to chat) con el mensaje inicial ya escrito. */
export const whatsappHref = `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(site.contact.whatsappText)}`;

/**
 * Navegación. `short` es la etiqueta compacta de la barra en desktop; el cajón móvil usa `label`.
 * `tambien`: otras rutas en las que la pestaña se marca como actual (Recursos agrupa Conócete mejor, crisis y Journal).
 * Pestañas pedidas por la Dra. (2 oct 2026): Conóceme (antes "Melanie"), Misión y visión (antes "Cómo trabajo") y Recursos.
 */
export interface NavItem {
  label: string;
  href: string;
  short?: string;
  tambien?: string[];
}
export const nav: readonly NavItem[] = [
  { label: 'Conóceme', href: '/melanie/' },
  { label: 'Misión y visión', href: '/mision-y-vision/' },
  { label: 'Terapia individual', href: '/terapia-individual/' },
  { label: 'Parejas', href: '/parejas/' },
  { label: 'Talleres y conferencias', short: 'Talleres', href: '/talleres-y-conferencias/' },
  { label: 'Recursos', href: '/recursos/', tambien: ['/conocete-mejor/', '/crisis/', '/journal/'] },
];

/** Líneas de ayuda para la página de Recursos (verificadas en las fuentes oficiales el 2 oct 2026). */
export const lineasAyuda = [
  {
    nombre: 'Línea PAS (ASSMCA)',
    numero: '1-800-981-0023',
    href: 'tel:18009810023',
    alterno: { numero: '988', href: 'tel:988' },
    texto: 'Apoyo emocional e intervención en crisis, gratuita y confidencial, las 24 horas, los 7 días de la semana. También ofrece chat y video para personas sordas (787‑615‑4112).',
    fuente: 'https://www.assmca.pr.gov/linea-pas',
  },
  {
    nombre: 'Oficina de la Procuradora de las Mujeres',
    numero: '787-722-2977',
    href: 'tel:17877222977',
    texto: 'Línea de orientación confidencial sobre violencia doméstica, las 24 horas, los 7 días de la semana.',
    fuente: 'https://www.mujer.pr.gov/',
  },
  {
    nombre: 'Emergencias',
    numero: '911',
    href: 'tel:911',
    texto: 'Si tu vida o la de otra persona está en peligro inmediato.',
  },
] as const;

export const cta = { label: 'Solicitar una cita', href: '/agenda/' } as const;

export const temas: Record<string, string> = {
  relaciones: 'Relaciones',
  comunicacion: 'Comunicación',
  emociones: 'Emociones',
  culpa: 'Culpa',
  perdon: 'Perdón',
  limites: 'Límites',
  vulnerabilidad: 'Vulnerabilidad',
  autoaceptacion: 'Autoaceptación',
  narrativas: 'Narrativas',
  ansiedad: 'Ansiedad',
  estres: 'Estrés',
  parejas: 'Parejas',
};

/** Modo vista previa: muestra las marcas de verificación y los borradores del Journal. */
export const isPreview = import.meta.env.DEV || import.meta.env.PUBLIC_PREVIEW === '1';
