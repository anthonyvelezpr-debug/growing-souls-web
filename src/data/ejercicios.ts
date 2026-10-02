/**
 * "Conócete mejor" · Ejercicios guiados de reflexión.
 *
 * Diez ejercicios guiados de escritura y reflexión, originales, inspirados en técnicas documentadas de la psicoterapia
 * (clarificación de valores de ACT, escritura expresiva, terapia narrativa, autocompasión, ciclo negativo de EFT,
 * carta de gratitud, "mejor yo posible"). Fuentes y límites en docs/instrumentos.md.
 *
 * Tono (pedido de la Dra. Acevedo, 2 oct 2026): profesional, cálido y claro. Oraciones completas, sin frases
 * tajantes ni efectistas ("lo que nadie te dice", "lo real"), sin dramatizar. Es trabajo clínico y se nota.
 *
 * Reglas:
 * - No son terapia ni diagnóstico. La persona escribe y, al final, lee un resumen con sus propias palabras.
 * - Lo que se escribe no sale del dispositivo. Si hay un destino de contactos configurado, solo viaja qué ejercicio
 *   se hizo y la fecha, nunca el contenido.
 * - Cada paso puede tener un título dinámico (función) para hablarle a la persona con lo que ya escribió.
 *
 * Este archivo se importa también en el navegador (el runner usa las funciones `reflejo`), así que no debe
 * depender de nada de Astro ni de Node.
 */

export type Intensidad = 'suave' | 'media' | 'honda';
export type Respuestas = Record<string, unknown>;
type Dinamico = string | ((r: Respuestas) => string);

interface PasoBase {
  id: string;
  titulo: Dinamico;
  guia?: Dinamico;
}
/** Pantalla de lectura entre pasos: encuadra lo que viene. */
export interface PasoNota extends PasoBase {
  tipo: 'nota';
  texto: string;
}
/** Pausa con respiración guiada (opcional) antes de un paso que pesa. */
export interface PasoPausa extends PasoBase {
  tipo: 'pausa';
  texto: string;
  respiracion?: boolean;
}
/** Escritura libre. `minutos` activa un temporizador suave (escritura expresiva). */
export interface PasoTexto extends PasoBase {
  tipo: 'texto';
  min: number;
  filas?: number;
  minutos?: number;
  ayudas?: string[];
  placeholder?: string;
}
/** Selección única (radio) o múltiple (casillas). `desde` toma las opciones de una respuesta anterior. */
export interface PasoOpciones extends PasoBase {
  tipo: 'opciones';
  opciones?: string[];
  desde?: string;
  multiple?: boolean;
  otra?: boolean;
  max?: number;
  min?: number;
}
/** Escala de 0 a 10 con dos etiquetas en los extremos. */
export interface PasoEscala extends PasoBase {
  tipo: 'escala';
  etiquetas: [string, string];
}
/** Varias áreas, cada una con su escala de 0 a 10. */
export interface PasoDominios extends PasoBase {
  tipo: 'dominios';
  dominios: Dominio[];
}
/** Elegir una frase de un texto escrito antes (`de`). */
export interface PasoMarcar extends PasoBase {
  tipo: 'marcar';
  de: string;
}
export type Paso = PasoNota | PasoPausa | PasoTexto | PasoOpciones | PasoEscala | PasoDominios | PasoMarcar;

export interface Dominio {
  id: string;
  nombre: string;
  descripcion: string;
}

/** Bloques del resumen final. El runner los pinta; aquí solo se decide qué decir. */
export type Bloque =
  | { tipo: 'titulo'; texto: string; eyebrow?: string }
  | { tipo: 'frase'; texto: string; etiqueta?: string; destacada?: boolean }
  | { tipo: 'parrafo'; texto: string }
  | { tipo: 'citas'; items: { etiqueta: string; texto: string }[] }
  | { tipo: 'columnas'; izquierda: { titulo: string; texto: string }; derecha: { titulo: string; texto: string } }
  | { tipo: 'chips'; etiqueta: string; items: string[] }
  | { tipo: 'medida'; etiqueta: string; valor: number; max: number; texto?: string }
  | { tipo: 'barras'; series: [string, string]; items: { nombre: string; a: number; b: number }[]; max: number }
  | { tipo: 'ciclo'; pasos: { etiqueta: string; texto: string }[] }
  | { tipo: 'carta'; texto: string; titulo?: string; fecha?: string; firma?: string; plegada?: boolean }
  | { tipo: 'aviso'; texto: string }
  | { tipo: 'cierre'; texto: string };

export interface Ejercicio {
  id: string;
  /** Grupo al que pertenece en el índice. */
  camino: Camino;
  titulo: string;
  subtitulo: string;
  /** Texto de la tarjeta. */
  descripcion: string;
  /** Con qué termina la persona. */
  teLlevas: string;
  duracion: string;
  intensidad: Intensidad;
  /** De dónde viene la técnica, en una frase honesta. */
  enfoque: string;
  fuentes: { nombre: string; url?: string }[];
  intro: string[];
  antes: string[];
  pasos: Paso[];
  reflejo: (r: Respuestas) => Bloque[];
  servicio: { label: string; href: string };
}

export type Camino = 'Valores y propósito' | 'Tu historia' | 'Tu relación contigo' | 'Tus relaciones';

export const caminos: { nombre: Camino; texto: string }[] = [
  { nombre: 'Valores y propósito', texto: 'Identifica lo que es importante para ti y cómo se refleja en tu día a día.' },
  {
    nombre: 'Tu historia',
    texto: 'Explora los mensajes que aprendiste al crecer y la manera en que cuentas tu propia historia.',
  },
  { nombre: 'Tu relación contigo', texto: 'Observa cómo te hablas y aquello que te cuesta enfrentar.' },
  {
    nombre: 'Tus relaciones',
    texto: 'Reflexiona sobre tu relación de pareja, lo que no has podido expresar y la gratitud hacia otras personas.',
  },
];

export const intensidades: Record<Intensidad, { etiqueta: string; texto: string; nivel: number }> = {
  suave: { etiqueta: 'Ligera', texto: 'Ejercicio breve y agradable.', nivel: 1 },
  media: { etiqueta: 'Moderada', texto: 'Invita a una reflexión honesta; suele ser llevadero.', nivel: 2 },
  honda: {
    etiqueta: 'Profunda',
    texto: 'Puede despertar emociones intensas. Te recomendamos hacerlo con tiempo y en un momento tranquilo.',
    nivel: 3,
  },
};

/* ---------- Ayudantes para leer respuestas en los resúmenes ---------- */
const t = (r: Respuestas, id: string) => (typeof r[id] === 'string' ? (r[id] as string).trim() : '');
const l = (r: Respuestas, id: string) => (Array.isArray(r[id]) ? (r[id] as string[]) : []);
const n = (r: Respuestas, id: string) => (typeof r[id] === 'number' ? (r[id] as number) : 0);
const d = (r: Respuestas, id: string) =>
  r[id] && typeof r[id] === 'object' ? (r[id] as Record<string, number>) : ({} as Record<string, number>);
const comillas = (s: string) => (s ? `«${s.replace(/^[«"]+|[»"]+$/g, '')}»` : '');
const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];
const PALABRAS = [
  'cero',
  'una',
  'dos',
  'tres',
  'cuatro',
  'cinco',
  'seis',
  'siete',
  'ocho',
  'nueve',
  'diez',
  'once',
  'doce',
  'trece',
  'catorce',
  'quince',
  'dieciséis',
  'diecisiete',
  'dieciocho',
  'diecinueve',
  'veinte',
  'veintiuna',
  'veintidós',
  'veintitrés',
];
const enPalabras = (k: number) => PALABRAS[k] ?? String(k);
const fechaLarga = (dt: Date) => `${dt.getDate()} de ${MESES[dt.getMonth()]} de ${dt.getFullYear()}`;
const enAnios = (k: number) => {
  const dt = new Date();
  dt.setFullYear(dt.getFullYear() + k);
  return dt;
};

const TERAPIA_INDIVIDUAL = { label: 'Terapia individual', href: '/terapia-individual/' };
const TERAPIA_PAREJA = { label: 'Terapia de pareja', href: '/parejas/' };

/* =====================================================================================================
   VALORES Y PROPÓSITO
   ===================================================================================================== */

const ochenta: Ejercicio = {
  id: 'ochenta',
  camino: 'Valores y propósito',
  titulo: 'Lo que es importante para ti',
  subtitulo: 'Clarificación de valores a partir de una escena: tu cumpleaños número ochenta.',
  descripcion:
    'Imaginarás la celebración de tu cumpleaños número ochenta y escribirás lo que te gustaría que dijeran de ti tres personas importantes. Luego compararás esa imagen con tu vida actual para identificar tus valores y un paso concreto.',
  teLlevas: 'Tus valores personales expresados en tus propias palabras y una acción concreta para esta semana.',
  duracion: '20 a 25 minutos',
  intensidad: 'honda',
  enfoque:
    'Ejercicio de clarificación de valores utilizado en la terapia de aceptación y compromiso (ACT). Adaptación original de Growing Souls.',
  fuentes: [
    { nombre: 'Hayes, Strosahl y Wilson (2012), Acceptance and Commitment Therapy, 2.ª ed.' },
    { nombre: 'Harris, R. (2009), ACT Made Simple' },
  ],
  intro: [
    'Los valores son las cualidades que deseas que guíen tu manera de vivir y de relacionarte. A veces los tenemos claros; otras veces, la rutina hace que perdamos de vista lo que es importante para nosotros.',
    'En este ejercicio imaginarás la celebración de tu cumpleaños número ochenta, en la que tres personas hablan de ti. Primero escribirás lo que te gustaría que dijeran y, después, lo que podrían decir hoy, considerando tu vida tal como es en este momento. Lo que escribas es solo para ti.',
  ],
  antes: [
    'Reserva unos veinte minutos sin interrupciones.',
    'Escribe con naturalidad y sin preocuparte por la redacción; no hay respuestas correctas.',
    'Es normal que surjan emociones durante el ejercicio. Si necesitas una pausa, puedes tomarla.',
  ],
  pasos: [
    {
      tipo: 'pausa',
      id: 'escena',
      titulo: 'Imagina la celebración.',
      texto:
        'Tómate un momento para imaginar el lugar: puede ser una casa, un patio o un salón. Hay comida, música y personas que te quieren. Observa quiénes están. En un momento, alguien pide la palabra para hablar de ti.',
      respiracion: true,
    },
    {
      tipo: 'texto',
      id: 'familia',
      titulo: 'Habla una persona de tu familia.',
      guia: 'Escribe lo que te gustaría que dijera de ti: lo que significaste para ella y cómo te recuerda.',
      placeholder: 'Puede ser tu pareja, un hijo o una hija, tu madre, tu hermana…',
      min: 120,
      filas: 6,
      ayudas: ['En los momentos difíciles, tú…', 'Algo que aprendí de ti fue…', 'Contigo siempre supe que…'],
    },
    {
      tipo: 'texto',
      id: 'amistad',
      titulo: 'Ahora habla una amistad de muchos años.',
      guia: 'Alguien que te ha acompañado en distintas etapas de tu vida.',
      min: 100,
      filas: 6,
      ayudas: ['Lo que siempre he admirado de ti es…', 'Cuando te necesité…', 'Algo que quizás pocos saben de ti es…'],
    },
    {
      tipo: 'texto',
      id: 'trabajo',
      titulo: 'Por último, habla alguien de tu trabajo, de tu comunidad o alguien a quien ayudaste.',
      guia: 'Escribe lo que te gustaría que esa persona recordara de ti.',
      min: 80,
      filas: 5,
      ayudas: ['Trabajar contigo fue…', 'Lo que hiciste por mí…', 'Tu aporte fue…'],
    },
    {
      tipo: 'nota',
      id: 'giro',
      titulo: 'Ahora, una mirada al presente.',
      texto:
        'Imagina que esas mismas tres personas hablaran hoy de ti, considerando tu vida tal como es en este momento: tus rutinas, tus prioridades y tu manera de relacionarte. Responde con honestidad y también con amabilidad hacia ti.',
    },
    {
      tipo: 'texto',
      id: 'hoy',
      titulo: '¿Qué dirían hoy?',
      guia: 'Incluye también lo positivo que ya está presente en tu vida.',
      min: 100,
      filas: 6,
      ayudas: ['Últimamente…', 'Algo que ha ido quedando en segundo plano es…', 'Algo que mantiene, pase lo que pase, es…'],
    },
    {
      tipo: 'opciones',
      id: 'valores',
      titulo: 'Vuelve a leer lo que te gustaría escuchar. ¿Qué valores aparecen en esas palabras?',
      guia: 'Elige los que mejor reflejan lo que escribiste.',
      multiple: true,
      max: 5,
      min: 1,
      otra: true,
      opciones: [
        'Presencia',
        'Honestidad',
        'Ternura',
        'Valentía',
        'Lealtad',
        'Generosidad',
        'Justicia',
        'Humor',
        'Creatividad',
        'Aprendizaje',
        'Fe o espiritualidad',
        'Libertad',
        'Cuidado del cuerpo',
        'Servicio a otros',
        'Constancia',
        'Paciencia',
        'Familia',
        'Amistad',
        'Protección de los míos',
        'Alegría',
        'Trabajo bien hecho',
        'Perdón',
        'Curiosidad',
        'Paz',
      ],
    },
    {
      tipo: 'escala',
      id: 'distancia',
      titulo: '¿Qué tanta diferencia notas entre tu vida actual y lo que te gustaría escuchar?',
      etiquetas: ['Muy poca diferencia', 'Mucha diferencia'],
    },
    {
      tipo: 'texto',
      id: 'centimetro',
      titulo: 'Escribe una acción pequeña que puedas realizar esta semana para acercarte a esos valores.',
      guia: 'Que sea concreta y con un día definido. Por ejemplo: «El jueves cenaré sin el teléfono».',
      min: 15,
      filas: 3,
    },
  ],
  reflejo: (r) => {
    const dist = n(r, 'distancia');
    const lectura =
      dist <= 3
        ? 'Tu vida actual parece estar bastante alineada con lo que valoras. El reto puede ser sostener lo que ya has construido y cuidarlo en las etapas de más exigencia.'
        : dist <= 6
          ? 'Notas cierta diferencia entre tu vida actual y lo que valoras, algo muy común. Ponerla en palabras es un primer paso para trabajar en ella de forma gradual.'
          : 'Notas una diferencia importante entre tu vida actual y lo que valoras. Puede resultar incómodo reconocerlo y, a la vez, es información valiosa: te orienta sobre hacia dónde dirigir tus próximos pasos.';
    return [
      { tipo: 'titulo', eyebrow: 'Tu resumen', texto: 'Lo que te gustaría que dijeran de ti' },
      {
        tipo: 'citas',
        items: [
          { etiqueta: 'Una persona de tu familia', texto: t(r, 'familia') },
          { etiqueta: 'Una amistad de muchos años', texto: t(r, 'amistad') },
          { etiqueta: 'Alguien de tu trabajo o tu comunidad', texto: t(r, 'trabajo') },
        ],
      },
      { tipo: 'parrafo', texto: 'Y esto es lo que, según tú, dirían hoy:' },
      { tipo: 'frase', texto: t(r, 'hoy') },
      { tipo: 'medida', etiqueta: 'La diferencia que percibes', valor: dist, max: 10, texto: lectura },
      { tipo: 'chips', etiqueta: 'Tus valores', items: l(r, 'valores') },
      { tipo: 'frase', etiqueta: 'Tu acción para esta semana', texto: t(r, 'centimetro'), destacada: true },
      {
        tipo: 'cierre',
        texto:
          'Los valores se practican en las decisiones de cada día. Una acción pequeña y sostenida en el tiempo puede marcar una diferencia importante.',
      },
    ];
  },
  servicio: TERAPIA_INDIVIDUAL,
};

const DOMINIOS_VIDA: Dominio[] = [
  {
    id: 'familia',
    nombre: 'Familia',
    descripcion: 'Padres, hijos, hermanos; la familia de origen o la que has formado.',
  },
  { id: 'pareja', nombre: 'Pareja e intimidad', descripcion: 'Tu relación de pareja, o el espacio para tenerla.' },
  { id: 'amistades', nombre: 'Amistades', descripcion: 'Las personas con quienes te sientes en confianza.' },
  { id: 'trabajo', nombre: 'Trabajo o vocación', descripcion: 'Lo que haces para vivir y lo que te gustaría aportar.' },
  { id: 'salud', nombre: 'Salud y cuerpo', descripcion: 'Dormir, moverte, alimentarte, ir al médico, descansar.' },
  { id: 'crecer', nombre: 'Crecimiento y aprendizaje', descripcion: 'Leer, estudiar, formarte, conocerte.' },
  {
    id: 'sentido',
    nombre: 'Fe, sentido o espiritualidad',
    descripcion: 'Lo que te conecta con algo más grande que tú.',
  },
  {
    id: 'juego',
    nombre: 'Descanso, recreación y creatividad',
    descripcion: 'Lo que haces por disfrute, sin que tenga que producir algo.',
  },
];

/** Diferencia importancia − energía por área, de mayor a menor. */
const brechas = (r: Respuestas) => {
  const imp = d(r, 'importancia');
  const ene = d(r, 'energia');
  return DOMINIOS_VIDA.map((dm) => ({
    dominio: dm,
    importa: imp[dm.id] ?? 0,
    recibe: ene[dm.id] ?? 0,
    brecha: (imp[dm.id] ?? 0) - (ene[dm.id] ?? 0),
  })).sort((a, b) => b.brecha - a.brecha || b.importa - a.importa);
};

const brecha: Ejercicio = {
  id: 'brecha',
  camino: 'Valores y propósito',
  titulo: 'Tus prioridades y tu energía',
  subtitulo: 'Compara la importancia de cada área de tu vida con la atención que recibe.',
  descripcion:
    'Valorarás del 0 al 10 cuánto importa cada área de tu vida y cuánta energía le dedicas en una semana típica. Al final verás ambas valoraciones juntas y el área con mayor diferencia.',
  teLlevas: 'Una visión clara de cómo distribuyes tu energía y una acción concreta para equilibrarla.',
  duracion: '10 a 12 minutos',
  intensidad: 'media',
  enfoque:
    'Basado en los ejercicios de valores por áreas de vida de la terapia de aceptación y compromiso (ACT). Áreas y preguntas propias de Growing Souls.',
  fuentes: [
    { nombre: 'Wilson, K. G. y Murrell, A. R. (2004), Values work in ACT' },
    { nombre: 'Lundgren, T. et al. (2012), The Bull’s-Eye Values Survey' },
  ],
  intro: [
    'Con frecuencia, nuestro tiempo y nuestra energía se dirigen hacia lo más urgente, como el trabajo, las responsabilidades o las necesidades de otras personas, y no siempre hacia lo que consideramos más importante.',
    'Este ejercicio te ayuda a observar esa relación con dos preguntas sencillas: cuánto importa cada área de tu vida y cuánta energía recibe. Comparar ambas respuestas puede orientarte sobre dónde hacer ajustes.',
  ],
  antes: [
    'Responde pensando en una semana típica, no en la ideal ni en la más difícil.',
    'Por energía nos referimos al tiempo, la atención y el cuidado que le dedicas a cada área.',
  ],
  pasos: [
    {
      tipo: 'dominios',
      id: 'importancia',
      titulo: '¿Cuánto importa cada área en tu vida?',
      guia: 'Responde según lo que es importante para ti, no según lo que crees que debería serlo. Del 0 (nada) al 10 (es fundamental).',
      dominios: DOMINIOS_VIDA,
    },
    {
      tipo: 'dominios',
      id: 'energia',
      titulo: 'En una semana típica, ¿cuánta energía le dedicas a cada área?',
      guia: 'Tiempo, atención y cuidado. Del 0 (ninguna) al 10 (la mayor parte).',
      dominios: DOMINIOS_VIDA,
    },
    {
      tipo: 'opciones',
      id: 'ladron',
      titulo: (r) => {
        const b = brechas(r)[0];
        return b.brecha > 0
          ? `La mayor diferencia está en ${b.dominio.nombre.toLowerCase()}: le das ${b.importa} de importancia y ${b.recibe} de energía. ¿Qué suele ocupar esa energía?`
          : 'Tus prioridades y tu semana están bastante alineadas. Aun así, ¿qué suele ocupar la energía que a veces no llega a lo importante?';
      },
      opciones: [
        'El trabajo y las responsabilidades',
        'El teléfono y las redes sociales',
        'La preocupación constante',
        'Atender a otras personas antes que a mí',
        'El cansancio',
        'Discusiones o tensiones',
        'No estoy seguro o segura',
      ],
      otra: true,
    },
    {
      tipo: 'texto',
      id: 'movimiento',
      titulo: (r) => {
        const b = brechas(r)[0];
        return `¿Qué podrías hacer esta semana para dedicarle un poco más de energía a ${b.dominio.nombre.toLowerCase()}?`;
      },
      guia: 'Una acción concreta, con día y hora si es posible.',
      min: 15,
      filas: 3,
    },
  ],
  reflejo: (r) => {
    const bs = brechas(r);
    const mayor = bs[0];
    const segunda = bs[1];
    const mejor = [...bs].sort((a, b) => a.brecha - b.brecha)[0];
    const lectura =
      mayor.brecha <= 1
        ? 'Tus prioridades y la energía que les dedicas están bastante alineadas. Es un buen punto de partida que vale la pena cuidar.'
        : `La mayor diferencia está en ${mayor.dominio.nombre.toLowerCase()}: ${mayor.importa} de importancia frente a ${mayor.recibe} de energía.${
            segunda && segunda.brecha > 1
              ? ` Le sigue ${segunda.dominio.nombre.toLowerCase()} (${segunda.importa} frente a ${segunda.recibe}).`
              : ''
          } El área con mejor equilibrio es ${mejor.dominio.nombre.toLowerCase()}.`;
    return [
      { tipo: 'titulo', eyebrow: 'Tu resumen', texto: 'La importancia de cada área y la energía que recibe' },
      {
        tipo: 'barras',
        series: ['Importancia', 'Energía'],
        max: 10,
        items: bs.map((b) => ({ nombre: b.dominio.nombre, a: b.importa, b: b.recibe })),
      },
      { tipo: 'parrafo', texto: lectura },
      { tipo: 'frase', etiqueta: 'Lo que suele ocupar tu energía', texto: t(r, 'ladron') },
      { tipo: 'frase', etiqueta: 'Tu acción para esta semana', texto: t(r, 'movimiento'), destacada: true },
      {
        tipo: 'cierre',
        texto:
          'El objetivo no es dedicarle lo mismo a todas las áreas, sino procurar que lo que más valoras reciba la atención que necesita.',
      },
    ];
  },
  servicio: TERAPIA_INDIVIDUAL,
};

const futuro: Ejercicio = {
  id: 'futuro',
  camino: 'Valores y propósito',
  titulo: 'Tu mejor yo posible',
  subtitulo: 'Una carta escrita desde dentro de cinco años, imaginando que las cosas salieron bien.',
  descripcion:
    'Imaginarás que han pasado cinco años y que las cosas salieron tan bien como era posible. Desde ese momento, te escribirás una carta sobre lo que cambió, lo que dejaste atrás y lo que te gustaría empezar hoy.',
  teLlevas: 'Una carta para releer dentro de un año y una meta concreta para empezar ahora.',
  duracion: '15 minutos',
  intensidad: 'media',
  enfoque:
    'Adaptación del ejercicio «mi mejor yo posible» (Laura King, 2001), uno de los más estudiados en psicología positiva.',
  fuentes: [
    { nombre: 'King, L. A. (2001), The health benefits of writing about life goals, PSPB' },
    { nombre: 'Peters, M. L. et al. (2010), Manipulating optimism: best possible self' },
  ],
  intro: [
    'Imaginar con detalle una versión posible y satisfactoria de tu vida ayuda a aclarar metas, identificar obstáculos y reconocer por dónde empezar. Diversos estudios asocian este ejercicio con un mayor optimismo y bienestar.',
    'Escribirás desde dentro de cinco años, como si ya hubiera ocurrido. No se trata de una versión perfecta, sino de una posible: la que podría darse si trabajas en ello y las circunstancias acompañan.',
  ],
  antes: [
    'Escribe en pasado, como quien cuenta algo que ya ocurrió.',
    'Procura ser concreto o concreta: personas, lugares y rutinas.',
  ],
  pasos: [
    {
      tipo: 'opciones',
      id: 'cambio',
      titulo: 'Han pasado cinco años y las cosas salieron bien. ¿Qué áreas de tu vida cambiaron más?',
      multiple: true,
      max: 3,
      min: 1,
      opciones: [
        'Mi salud',
        'Mi relación de pareja',
        'Mi trabajo',
        'Mis finanzas',
        'Mi familia',
        'Mis amistades',
        'Mi paz interior',
        'Un proyecto propio',
        'El lugar donde vivo',
        'La manera en que me trato',
      ],
    },
    {
      tipo: 'nota',
      id: 'voz',
      titulo: 'Ahora escribirás desde el futuro.',
      texto:
        'Quien escribe es tu yo de dentro de cinco años. Habla con cariño y con sinceridad, como se le habla a alguien que se conoce bien. Tiene algo que contarte y algo que pedirte.',
    },
    {
      tipo: 'texto',
      id: 'carta',
      titulo: 'Querido yo de hoy:',
      guia: 'Cuéntale qué cambió, qué tuviste que dejar atrás para llegar ahí, qué te preocupaba y salió bien, y qué te pide que empieces ahora.',
      min: 300,
      filas: 12,
      minutos: 10,
      ayudas: [
        'Lo primero que cambió fue…',
        'Tuve que dejar atrás…',
        'Algo que me preocupaba y salió bien fue…',
        'Te pido que empieces ahora con…',
      ],
    },
    {
      tipo: 'marcar',
      id: 'peticion',
      de: 'carta',
      titulo: 'Lee la carta con calma y selecciona la frase en la que tu yo futuro te pide algo.',
    },
    {
      tipo: 'texto',
      id: 'soltar',
      titulo: '¿Qué tuviste que dejar atrás para llegar ahí?',
      guia: 'Escribe una cosa: un hábito, una idea sobre ti, una relación o un temor.',
      min: 10,
      filas: 3,
    },
  ],
  reflejo: (r) => [
    { tipo: 'titulo', eyebrow: 'Tu resumen', texto: 'La carta de tu yo de dentro de cinco años' },
    { tipo: 'chips', etiqueta: 'Las áreas que más cambiaron', items: l(r, 'cambio') },
    {
      tipo: 'carta',
      titulo: 'Querido yo de hoy:',
      fecha: fechaLarga(enAnios(5)),
      texto: t(r, 'carta'),
      firma: 'Tú, dentro de cinco años',
    },
    { tipo: 'frase', etiqueta: 'Lo que te pide', texto: t(r, 'peticion'), destacada: true },
    { tipo: 'frase', etiqueta: 'Lo que dejaste atrás para llegar', texto: t(r, 'soltar') },
    {
      tipo: 'parrafo',
      texto: `Te sugerimos guardar esta carta (puedes imprimirla más abajo) y releerla el ${fechaLarga(enAnios(1))}. Será una buena oportunidad para observar tu progreso.`,
    },
    {
      tipo: 'cierre',
      texto: 'Imaginar el futuro con detalle no lo garantiza, pero sí ayuda a orientar las decisiones del presente.',
    },
  ],
  servicio: TERAPIA_INDIVIDUAL,
};

/* =====================================================================================================
   TU HISTORIA
   ===================================================================================================== */

const frases: Ejercicio = {
  id: 'frases',
  camino: 'Tu historia',
  titulo: 'Los mensajes que aprendiste al crecer',
  subtitulo: 'Frases que escuchaste en tu infancia y la influencia que pueden tener hoy.',
  descripcion:
    'Durante la infancia aprendemos mensajes sobre las emociones, las relaciones y nuestro valor personal. Algunos nos protegieron; otros pueden seguir influyendo en nuestras decisiones. Aquí podrás identificarlos y reformular uno de ellos.',
  teLlevas:
    'El mensaje que más influye en tu vida adulta, su efecto en ti y una versión reformulada con tus propias palabras.',
  duracion: '15 a 20 minutos',
  intensidad: 'honda',
  enfoque:
    'Trabajo con creencias tempranas y reglas de vida, común a la terapia cognitivo-conductual y a la terapia de esquemas. Las frases son de Growing Souls y no provienen de ningún cuestionario.',
  fuentes: [
    { nombre: 'Beck, J. S. (2011), Cognitive Behavior Therapy: Basics and Beyond, 2.ª ed.' },
    { nombre: 'Young, J. E., Klosko, J. S. y Weishaar, M. E. (2003), Schema Therapy' },
  ],
  intro: [
    'Desde muy temprano, las personas que nos crían nos transmiten ideas sobre lo que se siente y lo que se expresa, sobre cómo comportarnos y sobre lo que vale. Muchas de esas ideas se aprenden tan pronto que, con el tiempo, parecen parte de nuestra personalidad.',
    'Este ejercicio te invita a identificar algunos de esos mensajes. El propósito no es buscar culpables, ya que quienes nos criaron también aprendieron sus propios mensajes. El propósito es que puedas decidir, con más conciencia, cuáles deseas conservar.',
  ],
  antes: [
    'Puede despertar recuerdos o emociones intensas. Hazlo con tiempo y, si lo deseas, con un cuaderno a la mano.',
    'No hay respuestas correctas; lo importante es que sean tuyas.',
  ],
  pasos: [
    {
      tipo: 'opciones',
      id: 'oidas',
      titulo: '¿Cuáles de estas frases escuchaste al crecer?',
      guia: 'Marca las que reconozcas, aunque no fueran exactamente con esas palabras.',
      multiple: true,
      min: 1,
      otra: true,
      opciones: [
        'No llores, que eso no es nada.',
        'Tienes que ser fuerte.',
        'Lo que pasa en casa se queda en casa.',
        'Primero los demás; tú después.',
        'Si no lo vas a hacer bien, mejor no lo hagas.',
        '¿Y qué va a decir la gente?',
        'Eso no se dice.',
        'Tú sabes cómo es tu papá (o tu mamá); no lo pongas peor.',
        'Después de todo lo que he hecho por ti.',
        'Cállate, que los grandes están hablando.',
        'Pórtate bien, que si no…',
        'El que no trabaja no come.',
        'No confíes en nadie.',
        'Ya tú estás grande para eso.',
        'Tú no sirves para eso.',
        'Tienes que ser la mejor. El mejor.',
        'Pide perdón, aunque no fuera tu culpa.',
        'No molestes.',
        'Deja eso, que no es para ti.',
        'Nadie te va a querer así.',
        'Las cosas se aguantan.',
        'Dios está mirando.',
      ],
    },
    {
      tipo: 'opciones',
      id: 'fuentes',
      titulo: '¿De quién provenían principalmente?',
      multiple: true,
      min: 1,
      opciones: [
        'Mamá',
        'Papá',
        'Abuelos o abuelas',
        'Hermanos o hermanas',
        'La escuela',
        'La iglesia',
        'Otros adultos de la familia',
        'El vecindario o la comunidad',
      ],
    },
    {
      tipo: 'opciones',
      id: 'vigente',
      titulo: 'De las frases que marcaste, ¿cuál sigue influyendo más en ti hoy?',
      guia: 'La que más se parece a la manera en que te hablas a ti mismo o a ti misma.',
      desde: 'oidas',
    },
    {
      tipo: 'texto',
      id: 'hoy',
      titulo: (r) => `${comillas(t(r, 'vigente'))} ¿Cómo se manifiesta esta frase en tu vida adulta?`,
      guia: 'Piensa en dónde aparece: en el trabajo, en la pareja, con tus hijos o contigo. Puedes describir un ejemplo reciente.',
      min: 60,
      filas: 5,
      ayudas: ['La última vez que la noté fue…', 'Se nota en que yo suelo…', 'En mis relaciones se ve cuando…'],
    },
    {
      tipo: 'texto',
      id: 'precio',
      titulo: '¿Cómo te ha afectado seguir esa frase?',
      guia: 'En tu salud, en tus relaciones, en lo que has dejado de hacer o de decir.',
      min: 30,
      filas: 4,
    },
    {
      tipo: 'texto',
      id: 'protegio',
      titulo: '¿De qué te protegió en algún momento?',
      guia: 'Muchas de estas reglas surgieron para protegernos de algo. Reconocerlo no significa justificarlas.',
      min: 20,
      filas: 4,
    },
    {
      tipo: 'pausa',
      id: 'respira',
      titulo: 'Una pausa antes de continuar.',
      texto: 'Respira con calma tres veces. A continuación, reformularás el mensaje con tus propias palabras.',
      respiracion: true,
    },
    {
      tipo: 'texto',
      id: 'reescrita',
      titulo: (r) =>
        `Imagina a un niño o una niña de seis años a quien quieres mucho. Reformula ${comillas(t(r, 'vigente'))} tal como se lo dirías, con cuidado y respeto.`,
      guia: 'La misma situación y la misma intención de cuidar, con otras palabras.',
      min: 15,
      filas: 3,
    },
  ],
  reflejo: (r) => {
    const oidas = l(r, 'oidas');
    return [
      {
        tipo: 'titulo',
        eyebrow: 'Tu resumen',
        texto:
          oidas.length === 1 ? 'Reconociste una de estas frases' : `Reconociste ${enPalabras(oidas.length)} de estas frases`,
      },
      { tipo: 'chips', etiqueta: 'Las frases que reconociste', items: oidas },
      { tipo: 'chips', etiqueta: 'De quién provenían', items: l(r, 'fuentes') },
      { tipo: 'frase', etiqueta: 'La que más influye hoy', texto: comillas(t(r, 'vigente')) },
      { tipo: 'frase', etiqueta: 'Cómo se manifiesta hoy', texto: t(r, 'hoy') },
      {
        tipo: 'columnas',
        izquierda: { titulo: 'Cómo te ha afectado', texto: t(r, 'precio') },
        derecha: { titulo: 'De qué te protegió', texto: t(r, 'protegio') },
      },
      { tipo: 'frase', etiqueta: 'Tu versión reformulada', texto: comillas(t(r, 'reescrita')), destacada: true },
      {
        tipo: 'aviso',
        texto:
          'Haber reconocido varias frases no significa que algo esté mal contigo. Refleja que las personas que te criaron también crecieron con sus propios mensajes.',
      },
      {
        tipo: 'cierre',
        texto:
          'Estos mensajes no cambian de un día para otro, pero es posible responderles de una manera más compasiva. Hoy diste un primer paso con uno de ellos.',
      },
    ];
  },
  servicio: TERAPIA_INDIVIDUAL,
};

const historia: Ejercicio = {
  id: 'historia',
  camino: 'Tu historia',
  titulo: 'Tu historia desde otra perspectiva',
  subtitulo: 'Los mismos hechos, contados desde tres miradas distintas.',
  descripcion:
    'Escribirás tu historia en seis frases. Luego la contarás de nuevo desde lo que superaste y aprendiste, y después como la contaría una persona que te quiere. Los hechos no cambian; cambia la manera de narrarlos.',
  teLlevas: 'Tres versiones de tu historia y la frase que más te cuesta reconocer sobre ti.',
  duracion: '15 minutos',
  intensidad: 'honda',
  enfoque:
    'Inspirado en la terapia narrativa (White y Epston): la manera en que contamos nuestra historia influye en cómo nos vemos, y los mismos hechos admiten más de una lectura.',
  fuentes: [
    { nombre: 'White, M. y Epston, D. (1990), Narrative Means to Therapeutic Ends' },
    { nombre: 'Adler, J. M. (2012), Living into the story: agency and coherence in narrative identity' },
  ],
  intro: [
    'Todas las personas tenemos una versión de nuestra propia historia. A menudo es breve, se centra en lo que faltó o en lo que salió mal y, de tanto repetirla, puede parecer la única posible.',
    'En este ejercicio escribirás tu historia tres veces. Los hechos se mantienen; lo que cambia es la perspectiva desde la que se cuentan.',
  ],
  antes: [
    'Escribe seis frases en cada versión; el límite forma parte del ejercicio.',
    'No hace falta escribir bonito. Lo importante es que lo que escribas se sienta auténtico para ti.',
  ],
  pasos: [
    {
      tipo: 'texto',
      id: 'v1',
      titulo: 'Cuenta tu historia en seis frases.',
      guia: 'Escribe las primeras que surjan, sin pensarlo demasiado.',
      min: 80,
      filas: 6,
    },
    {
      tipo: 'opciones',
      id: 'tono',
      titulo: 'Léela de nuevo. ¿Desde qué lugar está contada?',
      opciones: [
        'Desde lo que me pasó',
        'Desde lo que me faltó',
        'Desde lo que logré',
        'Desde lo que me hicieron',
        'Desde lo que superé',
        'No sabría decir',
      ],
    },
    {
      tipo: 'nota',
      id: 'giro',
      titulo: 'Una misma historia puede contarse desde distintos lugares.',
      texto:
        'Sin cambiar ningún hecho: la misma infancia, la misma pérdida, el mismo trabajo. Lo que puede cambiar es lo que se coloca en el centro: lo que te ocurrió, o lo que hiciste con lo que te ocurrió.',
    },
    {
      tipo: 'texto',
      id: 'v2',
      titulo: 'Cuenta la misma historia en seis frases, desde lo que superaste y aprendiste.',
      guia: 'Los mismos hechos, con otro énfasis.',
      min: 80,
      filas: 6,
      ayudas: [
        'Cuando ocurrió aquello, lo que hice fue…',
        'Aunque no tenía todas las herramientas, …',
        'Hoy sigo adelante porque…',
      ],
    },
    {
      tipo: 'texto',
      id: 'v3',
      titulo: 'Ahora cuéntala como lo haría una persona que te quiere y te conoce bien.',
      guia: 'Si te ayuda, escríbela en tercera persona: «Ella…», «Él…».',
      min: 60,
      filas: 6,
    },
    {
      tipo: 'marcar',
      id: 'clave',
      de: 'v3',
      titulo: 'Lee esta última versión y selecciona la frase que más te cuesta creer sobre ti.',
    },
  ],
  reflejo: (r) => {
    const tono = t(r, 'tono');
    const lecturas: Record<string, string> = {
      'Desde lo que me pasó':
        'Tu primera versión está contada desde lo que te ocurrió, una manera muy común de narrar la propia vida.',
      'Desde lo que me faltó':
        'Tu primera versión está contada desde lo que faltó. Es una perspectiva frecuente que suele pesar; las otras dos versiones pueden ayudarte a equilibrarla.',
      'Desde lo que logré':
        'Tu primera versión está contada desde tus logros. Observa si la tercera versión incluye aspectos de ti que los logros no reflejan.',
      'Desde lo que me hicieron':
        'Tu primera versión está contada desde lo que otras personas te hicieron. Esa experiencia es válida y, a la vez, no es lo único que te define; la tercera versión puede ayudarte a verlo.',
      'Desde lo que superé':
        'Tu primera versión ya estaba contada desde lo que superaste. La tercera te permite ver, además, lo que has construido.',
      'No sabría decir':
        'No te fue fácil identificar desde dónde estaba contada la primera versión. Es frecuente y puede indicar un tema que vale la pena seguir explorando.',
    };
    return [
      { tipo: 'titulo', eyebrow: 'Tu resumen', texto: 'Tu historia, en tres versiones' },
      {
        tipo: 'citas',
        items: [
          { etiqueta: 'Tu primera versión', texto: t(r, 'v1') },
          { etiqueta: 'Desde lo que superaste', texto: t(r, 'v2') },
          { etiqueta: 'Como la contaría alguien que te quiere', texto: t(r, 'v3') },
        ],
      },
      { tipo: 'parrafo', texto: lecturas[tono] ?? '' },
      { tipo: 'frase', etiqueta: 'La frase que más te cuesta creer', texto: t(r, 'clave'), destacada: true },
      {
        tipo: 'parrafo',
        texto:
          'Esa frase puede ser un buen punto de partida para seguir reflexionando: muestra algo que otra persona reconoce en ti y que quizás todavía te cuesta ver.',
      },
      {
        tipo: 'cierre',
        texto: 'No podemos cambiar lo que ocurrió, pero sí la manera en que lo comprendemos y lo contamos.',
      },
    ];
  },
  servicio: TERAPIA_INDIVIDUAL,
};

/* =====================================================================================================
   TU RELACIÓN CONTIGO
   ===================================================================================================== */

const critica: Ejercicio = {
  id: 'critica',
  camino: 'Tu relación contigo',
  titulo: 'Tu diálogo interno',
  subtitulo: 'Cómo te hablas, de dónde viene esa voz y cómo responderle con compasión.',
  descripcion:
    'Muchas personas tienen una voz interna muy exigente. Aquí identificarás lo que te dice, en qué momentos aparece y de qué intenta protegerte, y practicarás una manera más compasiva de responderle.',
  teLlevas: 'Las frases de tu voz crítica, lo que intentan proteger y una respuesta más compasiva hacia ti.',
  duracion: '12 a 15 minutos',
  intensidad: 'media',
  enfoque:
    'Basado en la investigación sobre autocompasión (Kristin Neff) y en el trabajo con la autocrítica de la terapia centrada en la compasión (Paul Gilbert). Preguntas propias de Growing Souls.',
  fuentes: [
    { nombre: 'Neff, K. D. (2003), Self-compassion: an alternative conceptualization' },
    { nombre: 'Gilbert, P. (2009), The Compassionate Mind' },
  ],
  intro: [
    'Muchas personas tienen una voz interna que critica con dureza: señala errores, compara y exige más. Cuando lleva mucho tiempo presente, es fácil confundirla con una descripción objetiva de quiénes somos.',
    'Este ejercicio te ayuda a observar esa voz con más distancia. El objetivo no es eliminarla, sino aprender a responderle también desde la comprensión y la compasión.',
  ],
  antes: [
    'Escribe las frases tal como suenan en tu mente, aunque sean duras. Reconocerlas forma parte del proceso.',
  ],
  pasos: [
    {
      tipo: 'opciones',
      id: 'frases',
      titulo: '¿Qué te dice esa voz? Marca las frases que reconozcas.',
      multiple: true,
      min: 1,
      otra: true,
      opciones: [
        'No es suficiente.',
        'Siempre lo mismo contigo.',
        'Todo el mundo puede, menos tú.',
        'Te lo dije.',
        'No te quejes, que otros están peor.',
        'Ya es tarde para ti.',
        'No lo intentes, vas a quedar mal.',
        'Tienes que poder con todo.',
        'Nadie te va a aguantar así.',
        'Deja de hacerte la víctima.',
        'Eres un desastre.',
        '¿Y qué van a pensar?',
        'No mereces descansar todavía.',
        'Si te conocieran de verdad…',
      ],
    },
    {
      tipo: 'opciones',
      id: 'cuando',
      titulo: '¿En qué momentos se hace más fuerte?',
      multiple: true,
      min: 1,
      opciones: [
        'Cuando cometo un error',
        'Cuando descanso',
        'Cuando me comparo',
        'Cuando pido ayuda',
        'Frente al espejo',
        'Cuando digo que no',
        'Cuando las cosas me salen bien',
        'De noche, antes de dormir',
        'Cuando alguien me critica',
      ],
    },
    {
      tipo: 'escala',
      id: 'volumen',
      titulo: 'En un día típico, ¿qué tan presente está esa voz?',
      etiquetas: ['Casi no aparece', 'Está presente casi todo el tiempo'],
    },
    {
      tipo: 'texto',
      id: 'origen',
      titulo: '¿A quién te recuerda esa voz? ¿Dónde crees que la aprendiste?',
      guia: 'A veces se parece a una persona en particular; otras veces es una combinación de varias personas o experiencias.',
      min: 20,
      filas: 4,
    },
    {
      tipo: 'texto',
      id: 'protege',
      titulo: 'Aunque sea dura, esa voz suele intentar protegerte de algo. ¿De qué crees que te protege?',
      guia: 'Por ejemplo: del rechazo, de equivocarte frente a otros, de confiarte demasiado o de volver a sufrir.',
      min: 20,
      filas: 4,
    },
    {
      tipo: 'nota',
      id: 'amigo',
      titulo: 'Ahora imagina esta situación.',
      texto:
        'Una persona a quien quieres mucho se acerca y te cuenta que se dice a sí misma lo mismo que tú te dices, en una situación parecida. Te pide tu opinión.',
    },
    {
      tipo: 'texto',
      id: 'respuesta',
      titulo: '¿Qué le dirías?',
      guia: 'Escríbelo como se lo dirías, con el tono que usarías con esa persona.',
      min: 60,
      filas: 6,
    },
    {
      tipo: 'marcar',
      id: 'justa',
      de: 'respuesta',
      titulo: 'Selecciona la frase que más te gustaría escuchar a ti.',
    },
  ],
  reflejo: (r) => {
    const dichas = l(r, 'frases');
    return [
      { tipo: 'titulo', eyebrow: 'Tu resumen', texto: 'Tu voz crítica y tu respuesta compasiva' },
      { tipo: 'chips', etiqueta: 'Lo que te dice', items: dichas },
      { tipo: 'medida', etiqueta: 'Presencia en un día típico', valor: n(r, 'volumen'), max: 10 },
      { tipo: 'chips', etiqueta: 'Cuándo se hace más fuerte', items: l(r, 'cuando') },
      { tipo: 'frase', etiqueta: 'Dónde la aprendiste', texto: t(r, 'origen') },
      { tipo: 'frase', etiqueta: 'De qué intenta protegerte', texto: t(r, 'protege') },
      {
        tipo: 'columnas',
        izquierda: { titulo: 'Lo que te dices', texto: comillas(dichas[0] ?? '') },
        derecha: { titulo: 'Lo que le dirías a alguien que quieres', texto: comillas(t(r, 'justa')) },
      },
      {
        tipo: 'parrafo',
        texto:
          'La situación es la misma; lo que cambia es el tono. La frase que elegiste no niega las dificultades: las mira con más equilibrio y comprensión.',
      },
      {
        tipo: 'cierre',
        texto: 'No se trata de silenciar la autocrítica, sino de que la compasión también tenga un lugar en tu diálogo interno.',
      },
    ];
  },
  servicio: TERAPIA_INDIVIDUAL,
};

const evitar: Ejercicio = {
  id: 'evitar',
  camino: 'Tu relación contigo',
  titulo: 'Lo que has ido posponiendo',
  subtitulo: 'Identifica algo que has evitado, cómo te afecta y un primer paso posible.',
  descripcion:
    'A veces posponemos durante semanas o meses algo que nos genera malestar. En este ejercicio le pondrás nombre, observarás qué haces en su lugar y cómo te afecta, y elegirás un primer paso pequeño y alcanzable.',
  teLlevas: 'Claridad sobre lo que estás posponiendo, su efecto en tu bienestar y un primer paso con fecha.',
  duracion: '10 minutos',
  intensidad: 'media',
  enfoque:
    'Basado en el concepto de evitación experiencial de la terapia de aceptación y compromiso (ACT). Preguntas propias de Growing Souls.',
  fuentes: [{ nombre: 'Hayes, S. C. et al. (1996), Experiential avoidance and behavioral disorders' }],
  intro: [
    'Evitar algo que nos incomoda suele traer alivio a corto plazo, y por eso es una reacción tan común. Sin embargo, con el tiempo, aquello que evitamos tiende a mantenerse y a generar más preocupación.',
    'Este ejercicio no busca que lo resuelvas hoy. Te propone observarlo con calma durante unos minutos y definir un primer paso.',
  ],
  antes: ['Elige una sola situación. Si hay varias, escoge la que más te preocupa.'],
  pasos: [
    {
      tipo: 'opciones',
      id: 'que',
      titulo: '¿Qué has estado posponiendo?',
      otra: true,
      opciones: [
        'Una conversación pendiente',
        'Una decisión',
        'Una cita médica o un chequeo',
        'Un asunto económico o un trámite',
        'Un duelo',
        'Lo que siento por alguien',
        'Una relación que no está funcionando',
        'Una meta personal',
        'El cuidado de mi cuerpo',
        'Algo del pasado',
      ],
    },
    {
      tipo: 'texto',
      id: 'nombre',
      titulo: 'Descríbelo con tus palabras.',
      guia: 'Una o dos frases, lo más concretas posible. Lo que escribas es solo para ti.',
      min: 20,
      filas: 3,
    },
    {
      tipo: 'opciones',
      id: 'en_vez',
      titulo: '¿Qué sueles hacer en lugar de atenderlo?',
      multiple: true,
      max: 3,
      min: 1,
      opciones: [
        'Usar el teléfono',
        'Trabajar más',
        'Dormir',
        'Comer',
        'Limpiar, organizar o mantenerme ocupado u ocupada',
        'Discutir por otras cosas',
        'Ayudar a los demás',
        'Ver series o jugar',
        'Darle vueltas sin decidir',
        'Beber o fumar',
        'Salir y pasar poco tiempo en casa',
      ],
    },
    {
      tipo: 'texto',
      id: 'teme',
      titulo: 'Si lo enfrentaras, ¿qué temes que pase o que sientas?',
      min: 20,
      filas: 4,
    },
    {
      tipo: 'escala',
      id: 'costo',
      titulo: '¿Cuánto te está afectando posponerlo?',
      guia: 'En tu descanso, tu tranquilidad, tus finanzas, tus relaciones o tu salud.',
      etiquetas: ['Muy poco', 'Mucho'],
    },
    {
      tipo: 'texto',
      id: 'paso',
      titulo: '¿Cuál sería el primer paso más pequeño posible?',
      guia: 'Algo sencillo y alcanzable, como buscar un número de teléfono, abrir una carta o escribir la primera línea. Incluye día y hora.',
      min: 10,
      filas: 3,
    },
    {
      tipo: 'opciones',
      id: 'quien',
      titulo: '¿Con quién podrías compartir que vas a darlo?',
      otra: true,
      opciones: [
        'Prefiero no compartirlo por ahora',
        'Con mi pareja',
        'Con una amistad',
        'Con alguien de mi familia',
        'Con un profesional',
      ],
    },
  ],
  reflejo: (r) => {
    const enVez = l(r, 'en_vez');
    const bloques: Bloque[] = [
      { tipo: 'titulo', eyebrow: 'Tu resumen', texto: 'Lo que has estado posponiendo' },
      { tipo: 'frase', etiqueta: `Lo que pospones · ${t(r, 'que')}`, texto: t(r, 'nombre') },
      { tipo: 'chips', etiqueta: 'Lo que haces en su lugar', items: enVez },
      { tipo: 'frase', etiqueta: 'Lo que temes', texto: t(r, 'teme') },
      { tipo: 'medida', etiqueta: 'Cuánto te afecta posponerlo', valor: n(r, 'costo'), max: 10 },
      { tipo: 'frase', etiqueta: 'Tu primer paso', texto: t(r, 'paso'), destacada: true },
      { tipo: 'frase', etiqueta: 'Con quién lo compartirás', texto: t(r, 'quien') },
    ];
    if (enVez.includes('Beber o fumar')) {
      bloques.push({
        tipo: 'aviso',
        texto:
          'Si el alcohol, el tabaco u otras sustancias están afectando tu salud, tus finanzas o tus relaciones, puede ayudarte hablarlo con un profesional. Pedir apoyo es una forma de cuidarte.',
      });
    }
    bloques.push({
      tipo: 'cierre',
      texto:
        'Atender lo que hemos pospuesto suele resultar más llevadero cuando se hace paso a paso. Hoy diste el primero al reconocerlo.',
    });
    return bloques;
  },
  servicio: TERAPIA_INDIVIDUAL,
};

/* =====================================================================================================
   TUS RELACIONES
   ===================================================================================================== */

const PASOS_PAREJA = [
  'Reclamo, insisto o subo el tono',
  'Me callo y me alejo',
  'Me explico y me defiendo',
  'Cedo para que termine pronto',
  'Traigo temas del pasado',
  'Me muestro distante, como si nada pasara',
];
const PASOS_OTRO = [
  'Reclama, insiste o sube el tono',
  'Se calla y se aleja',
  'Se explica y se defiende',
  'Cede para que termine pronto',
  'Trae temas del pasado',
  'Se muestra distante, como si nada pasara',
];

const ciclo: Ejercicio = {
  id: 'ciclo',
  camino: 'Tus relaciones',
  titulo: 'Los patrones de discusión en la pareja',
  subtitulo: 'Identifica el ciclo que se repite en sus discusiones y tu parte en él.',
  descripcion:
    'Muchas parejas repiten un mismo patrón de discusión, aunque el tema cambie. En este ejercicio identificarás cómo empieza, cómo reacciona cada persona y qué emociones suelen quedar sin expresarse.',
  teLlevas: 'Una representación del ciclo con tus palabras y una frase que podría abrir una conversación diferente.',
  duracion: '12 a 15 minutos',
  intensidad: 'media',
  enfoque:
    'Basado en el concepto de ciclo negativo de la terapia focalizada en las emociones (EFT, Sue Johnson) y en la teoría del apego adulto. Preguntas propias de Growing Souls.',
  fuentes: [
    { nombre: 'Johnson, S. M. (2004), The Practice of Emotionally Focused Couple Therapy, 2.ª ed.' },
    { nombre: 'Mikulincer, M. y Shaver, P. R. (2016), Attachment in Adulthood' },
  ],
  intro: [
    'En muchas discusiones de pareja, el tema visible (el dinero, las tareas, el tiempo) no es lo único que está en juego. Con frecuencia se repite un patrón: una persona reclama o insiste, la otra se distancia, y cada reacción intensifica la de la otra.',
    'Este ejercicio no busca determinar quién tiene la razón. Su propósito es ayudarte a reconocer el patrón y las emociones que suelen quedar debajo de él.',
  ],
  antes: [
    'Hazlo a solas, pensando en la última discusión que se repitió.',
    'Si en tu relación hay miedo, agresiones físicas, insultos frecuentes o control sobre tu dinero o tus salidas, no se trata de un ciclo de pareja, sino de una situación que requiere ayuda especializada. Oficina de la Procuradora de las Mujeres, línea de orientación las 24 horas: 787-722-2977.',
  ],
  pasos: [
    {
      tipo: 'opciones',
      id: 'detonante',
      titulo: 'Piensa en la última discusión que se repitió. ¿Qué la provocó?',
      otra: true,
      opciones: [
        'Sentirme ignorado o ignorada',
        'Una crítica',
        'Sentir que todo recae en mí',
        'El uso del teléfono',
        'El dinero',
        'La familia de mi pareja',
        'La intimidad',
        'Una promesa que no se cumplió',
        'La crianza de los hijos',
        'Las tareas del hogar',
      ],
    },
    {
      tipo: 'opciones',
      id: 'mi_paso',
      titulo: 'Cuando comienza, ¿cuál suele ser tu primera reacción?',
      opciones: PASOS_PAREJA,
    },
    {
      tipo: 'opciones',
      id: 'su_paso',
      titulo: '¿Y cómo suele reaccionar tu pareja?',
      opciones: PASOS_OTRO,
    },
    {
      tipo: 'opciones',
      id: 'superficie',
      titulo: 'Durante la discusión, ¿qué se nota en ti?',
      multiple: true,
      max: 2,
      min: 1,
      opciones: ['Enojo', 'Frialdad', 'Sarcasmo', 'Llanto', 'Silencio', 'Control', 'Cansancio', 'Indiferencia'],
    },
    {
      tipo: 'opciones',
      id: 'fondo',
      titulo: '¿Y qué sientes en el fondo?',
      guia: 'Las emociones que suelen quedar sin expresarse.',
      multiple: true,
      max: 2,
      min: 1,
      opciones: [
        'Miedo a no ser importante para mi pareja',
        'Soledad',
        'Sentir que nunca es suficiente',
        'Miedo a que se vaya',
        'Sentir que fallé',
        'Sentirme invisible',
        'Sentirme controlado o controlada',
        'Vergüenza',
        'Miedo a volver a salir lastimado o lastimada',
      ],
    },
    {
      tipo: 'texto',
      id: 'nunca_digo',
      titulo: '¿Qué te cuesta expresar en voz alta durante esas discusiones?',
      min: 20,
      filas: 4,
      ayudas: ['Lo que necesito de ti es…', 'Me da miedo que…', 'Cuando te alejas, yo…', 'Cuando me reclamas, yo…'],
    },
    {
      tipo: 'texto',
      id: 'bien',
      titulo: 'Cuando están bien, ¿qué hace tu pareja que te hace sentir seguro o segura?',
      guia: 'Algo concreto que ya funciona entre ustedes.',
      min: 15,
      filas: 3,
    },
  ],
  reflejo: (r) => [
    { tipo: 'titulo', eyebrow: 'Tu resumen', texto: 'El ciclo, visto con perspectiva' },
    {
      tipo: 'ciclo',
      pasos: [
        { etiqueta: 'Comienza con', texto: t(r, 'detonante') },
        { etiqueta: 'Tú', texto: t(r, 'mi_paso') },
        { etiqueta: 'Tu pareja', texto: t(r, 'su_paso') },
        { etiqueta: 'Lo que sientes', texto: l(r, 'fondo').join(' y ').toLowerCase() },
      ],
    },
    {
      tipo: 'columnas',
      izquierda: { titulo: 'Lo que se ve', texto: l(r, 'superficie').join(', ') },
      derecha: { titulo: 'Lo que sientes en el fondo', texto: l(r, 'fondo').join(', ') },
    },
    { tipo: 'frase', etiqueta: 'Lo que te cuesta expresar', texto: t(r, 'nunca_digo'), destacada: true },
    {
      tipo: 'parrafo',
      texto:
        'Lo que se ve es lo que tu pareja percibe; lo que sientes en el fondo es lo que tú vives. Con frecuencia, el ciclo empieza a cambiar cuando una de las dos personas logra expresar lo que siente en lugar de reaccionar.',
    },
    { tipo: 'frase', etiqueta: 'Lo que ya funciona', texto: t(r, 'bien') },
    {
      tipo: 'cierre',
      texto:
        'El problema no es tu pareja ni eres tú: es el patrón que se repite entre ustedes. Reconocerlo es un paso importante para transformarlo juntos.',
    },
  ],
  servicio: TERAPIA_PAREJA,
};

const carta: Ejercicio = {
  id: 'carta',
  camino: 'Tus relaciones',
  titulo: 'Carta no enviada',
  subtitulo: 'Escritura expresiva para poner en palabras lo que no has podido decir.',
  descripcion:
    'Escribirás una carta que no se enviará, dirigida a alguien a quien no has podido expresarle lo que sientes. Durante doce minutos escribirás de forma continua y, al final, identificarás la frase más significativa.',
  teLlevas: 'Un espacio para expresar lo que llevabas dentro y la frase que más te costó escribir.',
  duracion: '20 minutos',
  intensidad: 'honda',
  enfoque:
    'Combina la técnica de la carta no enviada con el protocolo de escritura expresiva de James Pennebaker, uno de los ejercicios con más investigación en psicología.',
  fuentes: [
    { nombre: 'Pennebaker, J. W. y Beall, S. K. (1986), Confronting a traumatic event' },
    { nombre: 'Frattaroli, J. (2006), Experimental disclosure and its moderators: a meta-analysis' },
  ],
  intro: [
    'A veces hay cosas que no pudimos decir: porque la persona ya no está, porque no era posible hablar con ella, porque éramos muy pequeños o porque todavía nos afecta. Guardar esas emociones durante mucho tiempo puede resultar pesado.',
    'Esta carta no se envía; su propósito es ayudarte a expresar. Escribirás durante doce minutos de forma continua, sin corregir ni cuidar la ortografía. Las investigaciones sobre escritura expresiva sugieren que el beneficio está en el proceso de escribir, más que en el resultado.',
  ],
  antes: [
    'Busca un lugar tranquilo donde no tengas interrupciones.',
    'Es normal sentir emociones intensas durante algunas horas después de escribir; suelen disminuir en uno o dos días. Si lo que surge es más de lo que puedes manejar, detente y habla hoy con alguien de confianza o con un profesional.',
    'Si estás atravesando una crisis en este momento, te recomendamos no hacer este ejercicio hoy y buscar apoyo.',
  ],
  pasos: [
    {
      tipo: 'opciones',
      id: 'a_quien',
      titulo: '¿A quién le escribes?',
      otra: true,
      opciones: [
        'A alguien que ya no está',
        'A alguien con quien no puedo hablar',
        'A mi yo de niño o de niña',
        'A mi yo de hace unos años',
        'A mi cuerpo',
        'A alguien que me lastimó',
        'A alguien a quien lastimé',
        'A alguien a quien nunca le agradecí lo suficiente',
      ],
    },
    {
      tipo: 'nota',
      id: 'reglas',
      titulo: 'Algunas indicaciones antes de empezar.',
      texto:
        'Escribe durante doce minutos sin detenerte. No corrijas ni te preocupes por la forma. Si te quedas en blanco, repite la última frase hasta que surja otra. Escribe lo que sientes y piensas sobre esa persona y sobre ti, con la profundidad que te resulte cómoda. Lo que escribas es solo para ti.',
    },
    {
      tipo: 'texto',
      id: 'carta',
      titulo: (r) => `${t(r, 'a_quien')}.`,
      guia: 'Doce minutos de escritura continua.',
      min: 300,
      filas: 14,
      minutos: 12,
      ayudas: [
        'Lo que nunca te dije fue…',
        'Lo que más me dolió fue…',
        'Lo que necesitaba de ti era…',
        'Lo que quiero que sepas es…',
        'Lo que me llevo de ti es…',
      ],
    },
    {
      tipo: 'pausa',
      id: 'respira',
      titulo: 'Una pausa.',
      texto: 'Deja el teléfono o el teclado por un momento. Respira con calma tres veces antes de releer.',
      respiracion: true,
    },
    {
      tipo: 'marcar',
      id: 'dificil',
      de: 'carta',
      titulo: 'Lee tu carta con calma y selecciona la frase que más te costó escribir.',
    },
    {
      tipo: 'opciones',
      id: 'emocion',
      titulo: '¿Qué sentiste al escribirla?',
      multiple: true,
      max: 3,
      min: 1,
      opciones: [
        'Alivio',
        'Tristeza',
        'Enojo',
        'Culpa',
        'Ternura',
        'Miedo',
        'Vergüenza',
        'Paz',
        'Nostalgia',
        'Amor',
        'Vacío',
        'Agradecimiento',
      ],
    },
    {
      tipo: 'texto',
      id: 'necesito',
      titulo: 'Completa esta frase: lo que necesito ahora de mí es…',
      min: 10,
      filas: 3,
    },
  ],
  reflejo: (r) => [
    { tipo: 'titulo', eyebrow: 'Tu resumen', texto: 'Lo que pudiste expresar' },
    { tipo: 'frase', etiqueta: 'La frase que más te costó escribir', texto: t(r, 'dificil'), destacada: true },
    { tipo: 'chips', etiqueta: 'Lo que sentiste', items: l(r, 'emocion') },
    { tipo: 'frase', etiqueta: 'Lo que necesitas ahora de ti', texto: t(r, 'necesito') },
    { tipo: 'carta', titulo: `Tu carta · ${t(r, 'a_quien').toLowerCase()}`, texto: t(r, 'carta'), plegada: true },
    {
      tipo: 'aviso',
      texto:
        'Escribir sobre experiencias dolorosas puede dejarte con emociones intensas durante algunas horas. Según la investigación sobre escritura expresiva, el alivio suele llegar después. Si lo que surgió es más de lo que puedes manejar, habla hoy con alguien de confianza o con un profesional.',
    },
    {
      tipo: 'cierre',
      texto: 'Esta carta no necesitaba llegar a su destinatario. Su propósito era darle un lugar a lo que llevabas dentro.',
    },
  ],
  servicio: TERAPIA_INDIVIDUAL,
};

const gracias: Ejercicio = {
  id: 'gracias',
  camino: 'Tus relaciones',
  titulo: 'Carta de gratitud',
  subtitulo: 'Reconoce a una persona que marcó tu vida para bien.',
  descripcion:
    'Piensa en alguien que hizo algo importante por ti y a quien no le has agradecido como te gustaría. Le escribirás una carta y decidirás qué hacer con ella.',
  teLlevas: 'Una carta de gratitud lista para compartir y la decisión de cómo hacerlo.',
  duracion: '10 a 15 minutos',
  intensidad: 'suave',
  enfoque:
    'Basado en la «visita de gratitud» de Martin Seligman, uno de los ejercicios de psicología positiva con efectos más duraderos en los estudios.',
  fuentes: [
    { nombre: 'Seligman, M. E. P. et al. (2005), Positive psychology progress: empirical validation of interventions' },
  ],
  intro: [
    'Algunas personas influyen en nuestra vida con gestos que para ellas quizá fueron pequeños: una palabra en el momento oportuno, una oportunidad o su compañía en una etapa difícil. Muchas veces no llegamos a agradecérselo como quisiéramos.',
    'Los estudios sobre gratitud muestran que escribir una carta de agradecimiento, y especialmente leérsela a la persona, se asocia con un aumento del bienestar que puede durar semanas. También es normal sentir algo de nervios al pensar en compartirla.',
  ],
  antes: [
    'Si es posible, elige a una persona con quien puedas compartir la carta. Si ya no está, la carta conserva todo su valor.',
  ],
  pasos: [
    {
      tipo: 'texto',
      id: 'quien',
      titulo: 'Piensa en alguien que cambió tu vida para bien y a quien no le has agradecido del todo.',
      guia: 'Escribe su nombre.',
      min: 2,
      filas: 1,
    },
    {
      tipo: 'texto',
      id: 'que_hizo',
      titulo: (r) => `¿Qué hizo ${t(r, 'quien')}?`,
      guia: 'Describe un momento concreto: dónde estaban, qué dijo o qué hizo.',
      min: 60,
      filas: 5,
    },
    {
      tipo: 'texto',
      id: 'sin',
      titulo: '¿Qué sería diferente en tu vida si no lo hubiera hecho?',
      min: 30,
      filas: 4,
    },
    {
      tipo: 'texto',
      id: 'carta',
      titulo: (r) => `Escríbele a ${t(r, 'quien')}.`,
      guia: 'Comienza con su nombre. Cuéntale lo que hizo, cómo te impactó y lo que todavía conservas de aquello.',
      min: 150,
      filas: 10,
      minutos: 8,
    },
    {
      tipo: 'opciones',
      id: 'entregar',
      titulo: '¿Qué harás con la carta?',
      opciones: [
        'Leérsela en persona',
        'Enviársela',
        'Llamarle y leérsela',
        'Guardarla por ahora',
        'Ya no está: leerla en voz alta en su memoria',
      ],
    },
  ],
  reflejo: (r) => {
    const quien = t(r, 'quien');
    const entrega = t(r, 'entregar');
    const bloques: Bloque[] = [
      { tipo: 'titulo', eyebrow: 'Tu resumen', texto: `Lo que ${quien} significó en tu vida` },
      { tipo: 'frase', etiqueta: 'Lo que hizo', texto: t(r, 'que_hizo') },
      { tipo: 'frase', etiqueta: 'Lo que sería diferente sin eso', texto: t(r, 'sin') },
      { tipo: 'carta', titulo: `Para ${quien}`, texto: t(r, 'carta') },
      { tipo: 'frase', etiqueta: 'Lo que harás con ella', texto: entrega, destacada: true },
    ];
    if (entrega === 'Guardarla por ahora') {
      bloques.push({
        tipo: 'parrafo',
        texto:
          'Guardarla también está bien. Si en algún momento te sientes con disposición, compartirla puede ser muy significativo para ambas personas.',
      });
    }
    bloques.push({
      tipo: 'cierre',
      texto:
        'Agradecer de forma específica y personal es un gesto que suele hacer bien a quien lo recibe y también a quien lo expresa.',
    });
    return bloques;
  },
  servicio: TERAPIA_INDIVIDUAL,
};

export const ejercicios: Ejercicio[] = [
  ochenta,
  brecha,
  futuro,
  frases,
  historia,
  critica,
  evitar,
  ciclo,
  carta,
  gracias,
];

/** Orden sugerido si alguien quiere hacerlos todos (de los más ligeros a los más profundos, con el de pareja al final). */
export const caminoSugerido: string[] = [
  'brecha',
  'evitar',
  'critica',
  'frases',
  'historia',
  'carta',
  'ochenta',
  'futuro',
  'gracias',
  'ciclo',
];

/** Para la guía «¿Por dónde empiezo?» del índice. */
export const porDondeEmpezar: { si: string; id: string }[] = [
  { si: 'Si tienes poco tiempo y prefieres un ejercicio breve', id: 'brecha' },
  { si: 'Si hay algo que no has podido expresar', id: 'carta' },
  { si: 'Si en tu relación de pareja se repiten las mismas discusiones', id: 'ciclo' },
  { si: 'Si sueles ser muy exigente contigo', id: 'critica' },
  { si: 'Si quieres aclarar tus valores y prioridades', id: 'ochenta' },
  { si: 'Si buscas un ejercicio ligero y positivo', id: 'gracias' },
];

export const textosEjercicios = {
  aviso:
    'Los ejercicios son herramientas de reflexión personal; no constituyen terapia ni diagnóstico. Están diseñados para personas adultas que se sienten relativamente estables y desean conocerse mejor. Si estás atravesando una crisis, te recomendamos buscar apoyo profesional en lugar de realizarlos.',
  privacidad:
    'Lo que escribes se guarda únicamente en tu navegador, en este dispositivo y mientras la pestaña esté abierta; no se envía ni se almacena en ningún servidor. Si decides dejar tus datos para recibir seguimiento, solo se envían tu nombre, tu contacto, el nombre del ejercicio y la fecha, nunca lo que escribiste.',
  dispositivo:
    'Si usas una computadora compartida, borra lo que escribiste al terminar (encontrarás un botón al final) o cierra la pestaña.',
} as const;
