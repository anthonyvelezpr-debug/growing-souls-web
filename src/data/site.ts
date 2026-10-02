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
   * Destino de los contactos de "Conócete mejor" (autoevaluaciones). Se configura con la variable de entorno
   * PUBLIC_LEADS_ENDPOINT en el build (en GitHub: Settings → Secrets and variables → Actions → Variables).
   * Vacío = las autoevaluaciones muestran el resultado sin pedir datos. 'demo' = vista previa sin envío real.
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

/** Navegación. `short` es la etiqueta compacta de la barra en desktop; el cajón móvil usa `label`. */
export interface NavItem {
  label: string;
  href: string;
  short?: string;
}
export const nav: readonly NavItem[] = [
  { label: 'Conoce a Melanie', short: 'Melanie', href: '/melanie/' },
  { label: 'Cómo trabajo', href: '/como-trabajo/' },
  { label: 'Terapia individual', href: '/terapia-individual/' },
  { label: 'Parejas', href: '/parejas/' },
  { label: 'Talleres y conferencias', short: 'Talleres', href: '/talleres-y-conferencias/' },
  { label: 'Conócete mejor', href: '/conocete-mejor/' },
  { label: 'Journal', href: '/journal/' },
];

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
