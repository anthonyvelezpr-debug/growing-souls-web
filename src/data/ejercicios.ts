/**
 * "Conócete mejor" · Ejercicios de profundidad.
 *
 * Diez ejercicios guiados de escritura y reflexión, originales, inspirados en técnicas documentadas de la psicoterapia
 * (clarificación de valores de ACT, escritura expresiva, terapia narrativa, autocompasión, ciclo negativo de EFT,
 * carta de gratitud, "mejor yo posible"). Fuentes y límites en docs/instrumentos.md.
 *
 * Reglas:
 * - No son terapia ni diagnóstico. Son espejos: la persona escribe y, al final, lee sus propias palabras ordenadas.
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

/** Bloques del reflejo final. El runner los pinta; aquí solo se decide qué decir. */
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
  /** Camino al que pertenece en el índice. */
  camino: Camino;
  titulo: string;
  subtitulo: string;
  /** Texto de la tarjeta. */
  descripcion: string;
  /** Con qué se va la persona. */
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

export type Camino = 'Lo que importa' | 'De dónde vienes' | 'Contigo' | 'Con los demás';

export const caminos: { nombre: Camino; texto: string }[] = [
  { nombre: 'Lo que importa', texto: 'Valores, prioridades y hacia dónde va tu vida.' },
  { nombre: 'De dónde vienes', texto: 'Lo que aprendiste antes de poder elegir, y la historia que te cuentas.' },
  { nombre: 'Contigo', texto: 'Cómo te hablas y lo que prefieres no mirar.' },
  { nombre: 'Con los demás', texto: 'Lo que no se dijo, lo que se repite y lo que nunca agradeciste.' },
];

export const intensidades: Record<Intensidad, { etiqueta: string; texto: string; nivel: number }> = {
  suave: { etiqueta: 'Suave', texto: 'Ligero y, sobre todo, agradable.', nivel: 1 },
  media: { etiqueta: 'Media', texto: 'Pide honestidad; no suele doler.', nivel: 2 },
  honda: { etiqueta: 'Honda', texto: 'Puede remover. Hazlo con tiempo.', nivel: 3 },
};

/* ---------- Ayudantes para leer respuestas en los reflejos ---------- */
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
   LO QUE IMPORTA
   ===================================================================================================== */

const ochenta: Ejercicio = {
  id: 'ochenta',
  camino: 'Lo que importa',
  titulo: 'Tu discurso de los ochenta',
  subtitulo: 'Lo que quisieras que dijeran de ti. Y lo que dirían hoy.',
  descripcion:
    'Imagina tu cumpleaños número ochenta y escribe los tres discursos que quisieras escuchar. Después, los que escucharías hoy. La distancia entre ambos es tu brújula.',
  teLlevas: 'Tus valores en tus propias palabras y un primer paso concreto para esta semana.',
  duracion: '20 a 25 minutos',
  intensidad: 'honda',
  enfoque:
    'Ejercicio clásico de clarificación de valores, usado en la terapia de aceptación y compromiso (ACT). Versión original de Growing Souls.',
  fuentes: [
    { nombre: 'Hayes, Strosahl y Wilson (2012), Acceptance and Commitment Therapy, 2.ª ed.' },
    { nombre: 'Harris, R. (2009), ACT Made Simple' },
  ],
  intro: [
    'Hay una pregunta que casi nadie se hace en voz alta: ¿para qué estoy viviendo como vivo? Este ejercicio no la responde con ideas. La responde con una escena.',
    'Vas a imaginar tu cumpleaños número ochenta. Tres personas se levantan a hablar de ti. Primero escribirás lo que quisieras que dijeran. Después, lo más difícil: lo que dirían hoy, con tu vida tal como es. No hace falta que nadie lo lea.',
  ],
  antes: [
    'Busca veinte minutos sin interrupciones.',
    'Escribe rápido y sin corregir: lo que sale primero suele ser lo verdadero.',
    'Si en algún punto te emocionas, no es señal de que lo estés haciendo mal.',
  ],
  pasos: [
    {
      tipo: 'pausa',
      id: 'escena',
      titulo: 'Tu cumpleaños número ochenta.',
      texto:
        'Cierra los ojos un momento e imagina el lugar. Puede ser una casa, un patio, un salón. Hay comida, hay música de fondo, hay gente que te quiere. Mira quiénes están. Alguien pide silencio: van a hablar de ti.',
      respiracion: true,
    },
    {
      tipo: 'texto',
      id: 'familia',
      titulo: 'Se levanta alguien de tu familia.',
      guia: 'Escribe lo que, en el fondo, quisieras que dijera de ti. No lo que diría hoy: lo que te gustaría haber sido para esa persona.',
      placeholder: 'Puede ser tu pareja, un hijo, una hija, tu hermana, tu madre…',
      min: 120,
      filas: 6,
      ayudas: [
        'Cuando las cosas se pusieron difíciles, tú…',
        'Lo que aprendí de ti sin que me lo enseñaras fue…',
        'Contigo siempre supe que…',
      ],
    },
    {
      tipo: 'texto',
      id: 'amistad',
      titulo: 'Ahora habla una amiga o un amigo de toda la vida.',
      guia: 'Alguien que te conoció en varias épocas y te vio cambiar.',
      min: 100,
      filas: 6,
      ayudas: ['Lo que nunca cambió en ti fue…', 'Las veces que más te necesité…', 'Lo que la gente no sabe de ti es…'],
    },
    {
      tipo: 'texto',
      id: 'trabajo',
      titulo: 'Y por último, alguien de tu trabajo, de tu comunidad o alguien a quien ayudaste.',
      guia: 'Lo que quisieras que quedara de tu paso por ahí.',
      min: 80,
      filas: 5,
      ayudas: ['Trabajar contigo era…', 'Lo que hiciste por mí sin tener que hacerlo…', 'Dejaste…'],
    },
    {
      tipo: 'nota',
      id: 'giro',
      titulo: 'Ahora viene la parte que casi nadie quiere hacer.',
      texto:
        'Imagina que esas mismas tres personas hablaran hoy. No en tu cumpleaños ochenta: hoy, con tu vida exactamente como es, con tu agenda de esta semana y tus silencios de este mes. Sin crueldad y sin adornos. Con honestidad.',
    },
    {
      tipo: 'texto',
      id: 'hoy',
      titulo: '¿Qué dirían hoy?',
      guia: 'Con la misma honestidad con la que escribiste lo otro. Lo bueno que ya está también cuenta.',
      min: 100,
      filas: 6,
      ayudas: ['Últimamente está…', 'Lo que casi no hace ya es…', 'Lo que sí sigue haciendo, pase lo que pase, es…'],
    },
    {
      tipo: 'opciones',
      id: 'valores',
      titulo: 'Vuelve a leer los tres discursos que quisieras escuchar. ¿Qué valores están escondidos ahí?',
      guia: 'Elige hasta cinco. No los que suenan bien: los que de verdad aparecen en lo que escribiste.',
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
        'Aprender siempre',
        'Fe o espiritualidad',
        'Libertad',
        'Cuidar el cuerpo',
        'Servir a otros',
        'Constancia',
        'Paciencia',
        'Familia',
        'Amistad',
        'Proteger a los míos',
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
      titulo: '¿Qué tan lejos está tu vida de hoy de esos discursos?',
      etiquetas: ['Es la misma vida', 'Son dos vidas distintas'],
    },
    {
      tipo: 'texto',
      id: 'centimetro',
      titulo: 'Una sola cosa, esta semana, que mueva tu vida un centímetro hacia esos discursos.',
      guia: 'Pequeña, concreta y con día. No «ser mejor padre»: «el jueves, cenar sin teléfono».',
      min: 15,
      filas: 3,
    },
  ],
  reflejo: (r) => {
    const dist = n(r, 'distancia');
    const lectura =
      dist <= 3
        ? 'Estás más cerca de lo que creías. Lo que toca no es cambiar de vida: es sostener la que tienes y cuidarla de lo que la erosiona.'
        : dist <= 6
          ? 'Hay una brecha, y ya la sabías. La diferencia es que ahora tiene palabras, y con palabras se puede trabajar.'
          : 'Sentir esa distancia duele. También es lo más útil que ha pasado en estos veinte minutos: ahora sabes hacia dónde mirar, y eso no se puede desaprender.';
    return [
      { tipo: 'titulo', eyebrow: 'Tu reflejo', texto: 'Esto es lo que quieres que digan de ti.' },
      {
        tipo: 'citas',
        items: [
          { etiqueta: 'Alguien de tu familia', texto: t(r, 'familia') },
          { etiqueta: 'Una amistad de toda la vida', texto: t(r, 'amistad') },
          { etiqueta: 'Alguien de tu trabajo o tu comunidad', texto: t(r, 'trabajo') },
        ],
      },
      { tipo: 'parrafo', texto: 'Y esto es lo que, según tú, dirían hoy.' },
      { tipo: 'frase', texto: t(r, 'hoy') },
      { tipo: 'medida', etiqueta: 'La distancia que sentiste', valor: dist, max: 10, texto: lectura },
      { tipo: 'chips', etiqueta: 'Tus valores, en tus palabras', items: l(r, 'valores') },
      { tipo: 'frase', etiqueta: 'Tu centímetro de esta semana', texto: t(r, 'centimetro'), destacada: true },
      { tipo: 'cierre', texto: 'Nadie llega a los ochenta con la vida de los discursos. Se llega con centímetros.' },
    ];
  },
  servicio: TERAPIA_INDIVIDUAL,
};

const DOMINIOS_VIDA: Dominio[] = [
  {
    id: 'familia',
    nombre: 'Familia',
    descripcion: 'Padres, hijos, hermanos; la familia que tienes o la que elegiste.',
  },
  { id: 'pareja', nombre: 'Pareja e intimidad', descripcion: 'La relación que tienes, o el espacio para tenerla.' },
  { id: 'amistades', nombre: 'Amistades', descripcion: 'Las personas con las que no tienes que explicarte.' },
  { id: 'trabajo', nombre: 'Trabajo o vocación', descripcion: 'Lo que haces para vivir y lo que te gustaría aportar.' },
  { id: 'salud', nombre: 'Salud y cuerpo', descripcion: 'Dormir, moverte, comer, ir al médico, descansar.' },
  { id: 'crecer', nombre: 'Crecer y aprender', descripcion: 'Leer, estudiar, formarte, entenderte.' },
  {
    id: 'sentido',
    nombre: 'Fe, sentido o espiritualidad',
    descripcion: 'Lo que te conecta con algo más grande que tú.',
  },
  {
    id: 'juego',
    nombre: 'Juego, descanso y creatividad',
    descripcion: 'Lo que haces por puro gusto, sin que produzca nada.',
  },
];

/** Brecha importancia − energía por dominio, de mayor a menor. */
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
  camino: 'Lo que importa',
  titulo: 'Dónde se te va la vida',
  subtitulo: 'Lo que dices que importa frente a lo que recibe tu energía.',
  descripcion:
    'Puntúa cuánto importa cada área de tu vida y cuánta energía recibe de verdad en una semana normal. Verás las dos cosas juntas, y la brecha más grande.',
  teLlevas: 'Un mapa claro de la distancia entre tus prioridades y tu semana, y un movimiento concreto.',
  duracion: '10 a 12 minutos',
  intensidad: 'media',
  enfoque:
    'Basado en los ejercicios de «vida valiosa» de la terapia de aceptación y compromiso (ACT). Áreas y preguntas propias.',
  fuentes: [
    { nombre: 'Wilson, K. G. y Murrell, A. R. (2004), Values work in ACT' },
    { nombre: 'Lundgren, T. et al. (2012), The Bull’s-Eye Values Survey' },
  ],
  intro: [
    'Casi nadie vive según sus prioridades. Vivimos según lo que grita más fuerte: el trabajo, el teléfono, las urgencias de otros. Y lo que de verdad importa, como casi nunca grita, espera.',
    'Este ejercicio te pide dos cosas muy simples: cuánto importa cada área de tu vida y cuánto recibe. La verdad está en la resta.',
  ],
  antes: [
    'Responde por una semana normal, no por la ideal ni por la peor.',
    'Energía no es solo tiempo: es atención, cuidado, presencia.',
  ],
  pasos: [
    {
      tipo: 'dominios',
      id: 'importancia',
      titulo: '¿Cuánto importa cada área en tu vida?',
      guia: 'No lo que debería importar: lo que importa. De 0 (nada) a 10 (es central).',
      dominios: DOMINIOS_VIDA,
    },
    {
      tipo: 'dominios',
      id: 'energia',
      titulo: 'En una semana normal, ¿cuánta de tu energía va de verdad a cada área?',
      guia: 'Energía: tiempo, atención, cuidado. De 0 (nada) a 10 (casi toda).',
      dominios: DOMINIOS_VIDA,
    },
    {
      tipo: 'opciones',
      id: 'ladron',
      titulo: (r) => {
        const b = brechas(r)[0];
        return b.brecha > 0
          ? `Tu brecha más grande está en ${b.dominio.nombre.toLowerCase()}: le das ${b.importa} de importancia y ${b.recibe} de energía. ¿Qué se lleva la energía que no llega ahí?`
          : 'Tus prioridades y tu semana van bastante parejas. Aun así, ¿qué se lleva la energía que a veces no llega a lo que importa?';
      },
      opciones: [
        'El trabajo que nunca termina',
        'El teléfono y las redes',
        'Preocuparme y darle vueltas a todo',
        'Cuidar a otros antes que a mí',
        'El cansancio: no me queda nada',
        'Discusiones y tensiones',
        'No sé; se va sin que me dé cuenta',
      ],
      otra: true,
    },
    {
      tipo: 'texto',
      id: 'movimiento',
      titulo: (r) => {
        const b = brechas(r)[0];
        return `¿Qué haría distinto esta semana una persona para quien ${b.dominio.nombre.toLowerCase()} importa ${b.importa} de 10?`;
      },
      guia: 'Una acción concreta, con día y hora si puedes.',
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
        ? 'Tus prioridades y tu semana van bastante alineadas. Eso es raro y vale la pena cuidarlo.'
        : `La brecha más grande está en ${mayor.dominio.nombre.toLowerCase()}: ${mayor.importa} de importancia frente a ${mayor.recibe} de energía.${
            segunda && segunda.brecha > 1
              ? ` Le sigue ${segunda.dominio.nombre.toLowerCase()} (${segunda.importa} frente a ${segunda.recibe}).`
              : ''
          } El área mejor cuidada en proporción: ${mejor.dominio.nombre.toLowerCase()}.`;
    return [
      { tipo: 'titulo', eyebrow: 'Tu reflejo', texto: 'Lo que importa y lo que recibe.' },
      {
        tipo: 'barras',
        series: ['Importa', 'Recibe'],
        max: 10,
        items: bs.map((b) => ({ nombre: b.dominio.nombre, a: b.importa, b: b.recibe })),
      },
      { tipo: 'parrafo', texto: lectura },
      { tipo: 'frase', etiqueta: 'Lo que se lleva la energía', texto: t(r, 'ladron') },
      { tipo: 'frase', etiqueta: 'Tu movimiento de esta semana', texto: t(r, 'movimiento'), destacada: true },
      {
        tipo: 'cierre',
        texto: 'No se trata de equilibrarlo todo. Se trata de que lo que más importa no sea lo que menos recibe.',
      },
    ];
  },
  servicio: TERAPIA_INDIVIDUAL,
};

const futuro: Ejercicio = {
  id: 'futuro',
  camino: 'Lo que importa',
  titulo: 'Carta desde dentro de cinco años',
  subtitulo: 'Tu yo del futuro te escribe. Y te pide algo.',
  descripcion:
    'Imagina que han pasado cinco años y las cosas salieron tan bien como podían salir. Esa persona te escribe hoy: qué cambió, qué soltó, qué te pide que empieces.',
  teLlevas: 'Una carta para releer dentro de un año y la petición concreta de tu yo futuro.',
  duracion: '15 minutos',
  intensidad: 'media',
  enfoque:
    'Adaptación del ejercicio «mi mejor yo posible» (Laura King, 2001), uno de los más estudiados en psicología positiva.',
  fuentes: [
    { nombre: 'King, L. A. (2001), The health benefits of writing about life goals, PSPB' },
    { nombre: 'Peters, M. L. et al. (2010), Manipulating optimism: best possible self' },
  ],
  intro: [
    'El futuro no se predice. Se ensaya. Cuando te imaginas con detalle una versión de tu vida que salió bien, no estás soñando: estás ordenando qué importa, qué estorba y por dónde se empieza.',
    'Vas a escribir desde dentro de cinco años, como si ya hubiera pasado. No la versión perfecta: la que podría ocurrir de verdad si trabajas en ello y la vida acompaña un poco.',
  ],
  antes: ['Escribe en pasado, como quien cuenta lo que ya ocurrió.', 'Sé concreto: nombres, lugares, rutinas.'],
  pasos: [
    {
      tipo: 'opciones',
      id: 'cambio',
      titulo: 'Han pasado cinco años y las cosas salieron tan bien como podían salir. ¿Qué cambió más?',
      multiple: true,
      max: 3,
      min: 1,
      opciones: [
        'Mi salud',
        'Mi pareja',
        'Mi trabajo',
        'Mi dinero',
        'Mi familia',
        'Mis amistades',
        'Mi paz interior',
        'Un proyecto propio',
        'Dónde vivo',
        'Cómo me trato',
      ],
    },
    {
      tipo: 'nota',
      id: 'voz',
      titulo: 'Ahora cambia de voz.',
      texto:
        'Quien escribe es tu yo de dentro de cinco años. Habla con cariño y sin adornos, como se le habla a alguien que uno conoce bien. Tiene algo que contarte y algo que pedirte.',
    },
    {
      tipo: 'texto',
      id: 'carta',
      titulo: 'Querido yo de hoy:',
      guia: 'Cuéntale qué cambió, qué tuviste que soltar para llegar aquí, qué te daba miedo y resultó bien, y qué te pide que empieces ahora.',
      min: 300,
      filas: 12,
      minutos: 10,
      ayudas: [
        'Lo primero que cambió fue…',
        'Tuve que soltar…',
        'Lo que te daba miedo y salió bien fue…',
        'Te pido que empieces ahora con…',
      ],
    },
    {
      tipo: 'marcar',
      id: 'peticion',
      de: 'carta',
      titulo: 'Lee la carta despacio. Toca la frase donde tu yo futuro te pide algo.',
    },
    {
      tipo: 'texto',
      id: 'soltar',
      titulo: 'Lo que tuviste que soltar para llegar ahí:',
      guia: 'Una cosa. Un hábito, una idea sobre ti, una relación, un miedo.',
      min: 10,
      filas: 3,
    },
  ],
  reflejo: (r) => [
    { tipo: 'titulo', eyebrow: 'Tu reflejo', texto: 'Lo que te escribió tu yo de dentro de cinco años.' },
    { tipo: 'chips', etiqueta: 'Lo que más cambió', items: l(r, 'cambio') },
    {
      tipo: 'carta',
      titulo: 'Querido yo de hoy:',
      fecha: fechaLarga(enAnios(5)),
      texto: t(r, 'carta'),
      firma: 'Tú, dentro de cinco años',
    },
    { tipo: 'frase', etiqueta: 'Lo que te pide', texto: t(r, 'peticion'), destacada: true },
    { tipo: 'frase', etiqueta: 'Lo que soltaste para llegar', texto: t(r, 'soltar') },
    {
      tipo: 'parrafo',
      texto: `Guarda esta carta (abajo puedes imprimirla). Léela de nuevo el ${fechaLarga(enAnios(1))}. Vas a saber si le hiciste caso.`,
    },
    { tipo: 'cierre', texto: 'El futuro no se predice. Se ensaya.' },
  ],
  servicio: TERAPIA_INDIVIDUAL,
};

/* =====================================================================================================
   DE DÓNDE VIENES
   ===================================================================================================== */

const frases: Ejercicio = {
  id: 'frases',
  camino: 'De dónde vienes',
  titulo: 'Las frases que te criaron',
  subtitulo: 'Las reglas que te dieron antes de que pudieras elegir.',
  descripcion:
    'Antes de tener opinión propia ya tenías reglas: te las dijeron en casa, en la escuela, en la iglesia. Algunas te protegieron. Otras todavía te gobiernan sin que lo notes.',
  teLlevas: 'La frase que sigue mandando en tu vida adulta, lo que te ha costado y una versión reescrita por ti.',
  duracion: '15 a 20 minutos',
  intensidad: 'honda',
  enfoque:
    'Trabajo con creencias tempranas y reglas de vida, común a la terapia cognitivo-conductual y a la terapia de esquemas. Las frases son de Growing Souls, no de ningún cuestionario.',
  fuentes: [
    { nombre: 'Beck, J. S. (2011), Cognitive Behavior Therapy: Basics and Beyond, 2.ª ed.' },
    { nombre: 'Young, J. E., Klosko, J. S. y Weishaar, M. E. (2003), Schema Therapy' },
  ],
  intro: [
    'Nadie te preguntó. Cuando tenías cinco años, siete, diez, alguien te dijo cómo eran las cosas: qué se siente y qué no, qué se dice y qué se calla, qué vale y qué no. Lo aprendiste tan temprano que hoy no parece aprendido: parece tu carácter.',
    'Este ejercicio te pone delante esas frases. No para culpar a nadie: las personas que te criaron fueron criadas con frases también. Para que puedas elegir, por fin, cuáles conservar.',
  ],
  antes: [
    'Puede remover. Hazlo con tiempo y, si puedes, con un cuaderno al lado.',
    'No hay respuestas correctas. Hay respuestas tuyas.',
  ],
  pasos: [
    {
      tipo: 'opciones',
      id: 'oidas',
      titulo: '¿Cuáles de estas frases escuchaste creciendo?',
      guia: 'Marca todas las que reconozcas, aunque no fueran con esas palabras exactas.',
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
      titulo: '¿De quién venían, sobre todo?',
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
        'El barrio, la calle',
      ],
    },
    {
      tipo: 'opciones',
      id: 'vigente',
      titulo: 'De las que marcaste, ¿cuál sigue mandando hoy?',
      guia: 'La que más se parece a cómo te hablas cuando nadie te oye.',
      desde: 'oidas',
    },
    {
      tipo: 'texto',
      id: 'hoy',
      titulo: (r) => `${comillas(t(r, 'vigente'))} ¿Cómo se ve esa frase en tu vida adulta?`,
      guia: 'Dónde aparece: en el trabajo, en pareja, con tus hijos, contigo. Un ejemplo reciente.',
      min: 60,
      filas: 5,
      ayudas: [
        'La última vez que la obedecí fue…',
        'Se nota en que yo nunca…',
        'Con mi pareja (o mis hijos) se ve cuando…',
      ],
    },
    {
      tipo: 'texto',
      id: 'precio',
      titulo: '¿Qué te ha costado obedecerla?',
      guia: 'En salud, en relaciones, en cosas que no hiciste, en cosas que no dijiste.',
      min: 30,
      filas: 4,
    },
    {
      tipo: 'texto',
      id: 'protegio',
      titulo: '¿Y de qué te protegió, en algún momento?',
      guia: 'Casi todas las reglas nacieron para protegerte de algo. Reconocerlo no es justificarlas.',
      min: 20,
      filas: 4,
    },
    {
      tipo: 'pausa',
      id: 'respira',
      titulo: 'Esto pesa.',
      texto: 'Antes de seguir, respira tres veces con calma. Lo que viene es lo que te vas a llevar.',
      respiracion: true,
    },
    {
      tipo: 'texto',
      id: 'reescrita',
      titulo: (r) =>
        `Imagina a un niño o una niña de seis años que quieres mucho. Reescribe ${comillas(t(r, 'vigente'))} como se lo dirías a esa criatura.`,
      guia: 'Misma situación, misma intención de cuidar. Otras palabras.',
      min: 15,
      filas: 3,
    },
  ],
  reflejo: (r) => {
    const oidas = l(r, 'oidas');
    return [
      { tipo: 'titulo', eyebrow: 'Tu reflejo', texto: `Creciste con ${enPalabras(oidas.length)} de estas frases.` },
      { tipo: 'chips', etiqueta: 'Las que reconociste', items: oidas },
      { tipo: 'chips', etiqueta: 'De quién venían', items: l(r, 'fuentes') },
      { tipo: 'frase', etiqueta: 'La que sigue mandando', texto: comillas(t(r, 'vigente')) },
      { tipo: 'frase', etiqueta: 'Cómo se ve hoy', texto: t(r, 'hoy') },
      {
        tipo: 'columnas',
        izquierda: { titulo: 'Lo que te ha costado', texto: t(r, 'precio') },
        derecha: { titulo: 'De lo que te protegió', texto: t(r, 'protegio') },
      },
      { tipo: 'frase', etiqueta: 'La regla, reescrita por ti', texto: comillas(t(r, 'reescrita')), destacada: true },
      {
        tipo: 'aviso',
        texto:
          'Si marcaste muchas, no significa que algo esté mal contigo. Significa que te criaron personas que también fueron criadas con frases.',
      },
      { tipo: 'cierre', texto: 'Las frases que te criaron no se borran. Se les responde. Hoy le respondiste a una.' },
    ];
  },
  servicio: TERAPIA_INDIVIDUAL,
};

const historia: Ejercicio = {
  id: 'historia',
  camino: 'De dónde vienes',
  titulo: 'Tu vida en seis frases',
  subtitulo: 'Los mismos hechos. Otro narrador.',
  descripcion:
    'Cuenta tu vida en seis frases, las primeras que salgan. Después cuéntala desde lo que sobreviviste. Y después como la contaría alguien que te quiere. Mismos hechos; tres historias.',
  teLlevas: 'Tres versiones de tu historia y la frase que te cuesta creer.',
  duracion: '15 minutos',
  intensidad: 'honda',
  enfoque:
    'Inspirado en la terapia narrativa (White y Epston): la historia que cuentas sobre ti no es la única posible con los mismos hechos.',
  fuentes: [
    { nombre: 'White, M. y Epston, D. (1990), Narrative Means to Therapeutic Ends' },
    { nombre: 'Adler, J. M. (2012), Living into the story: agency and coherence in narrative identity' },
  ],
  intro: [
    'Todos cargamos una versión de nuestra vida. Suele ser corta, suele estar contada desde lo que faltó, y la repetimos tanto que parece la única.',
    'Aquí vas a escribirla tres veces. No cambia ni un hecho. Cambia quién narra.',
  ],
  antes: [
    'Seis frases, no más. La limitación es parte del ejercicio.',
    'No busques escribir bonito. Busca escribir verdad.',
  ],
  pasos: [
    {
      tipo: 'texto',
      id: 'v1',
      titulo: 'Cuenta tu vida en seis frases.',
      guia: 'Las primeras que salgan. Sin pensar demasiado.',
      min: 80,
      filas: 6,
    },
    {
      tipo: 'opciones',
      id: 'tono',
      titulo: 'Léela. ¿Desde dónde está contada?',
      opciones: [
        'Desde lo que me pasó',
        'Desde lo que me faltó',
        'Desde lo que logré',
        'Desde lo que me hicieron',
        'Desde lo que sobreviví',
        'No sabría decir',
      ],
    },
    {
      tipo: 'nota',
      id: 'giro',
      titulo: 'Toda historia se puede contar desde otro lugar.',
      texto:
        'Sin cambiar un solo hecho. La misma infancia, la misma pérdida, el mismo trabajo. Lo que cambia es qué se pone en el centro: lo que te pasó, o lo que hiciste con lo que te pasó.',
    },
    {
      tipo: 'texto',
      id: 'v2',
      titulo: 'Cuenta la misma vida en seis frases, desde lo que sobreviviste y lo que aprendiste.',
      guia: 'Mismos hechos. Otro centro.',
      min: 80,
      filas: 6,
      ayudas: ['Cuando pasó aquello, lo que hice fue…', 'Nadie me enseñó, y aun así…', 'Sigo aquí porque…'],
    },
    {
      tipo: 'texto',
      id: 'v3',
      titulo: 'Y ahora como la contaría alguien que te quiere y te conoce bien.',
      guia: 'En tercera persona, si te ayuda: «Ella…», «Él…».',
      min: 60,
      filas: 6,
    },
    {
      tipo: 'marcar',
      id: 'clave',
      de: 'v3',
      titulo: 'Lee esa última versión. Toca la frase que más te cuesta creer.',
    },
  ],
  reflejo: (r) => {
    const tono = t(r, 'tono');
    const lecturas: Record<string, string> = {
      'Desde lo que me pasó':
        'La primera versión está contada desde lo que te pasó. Es la más común: la vida como algo que ocurre.',
      'Desde lo que me faltó':
        'La primera versión está contada desde lo que faltó. Es la que más pesa, y la que más se repite.',
      'Desde lo que logré':
        'La primera versión está contada desde lo que lograste. Fíjate en si en la tercera aparece algo que los logros no cuentan.',
      'Desde lo que me hicieron':
        'La primera versión está contada desde lo que te hicieron. Es verdad, y no es toda la verdad: la tercera versión lo sabe.',
      'Desde lo que sobreviví':
        'Ya la primera versión estaba contada desde lo que sobreviviste. La tercera te deja ver lo que, además, construiste.',
      'No sabría decir':
        'No supiste decir desde dónde estaba contada la primera. A veces es la señal de que la historia todavía no es tuya del todo.',
    };
    return [
      { tipo: 'titulo', eyebrow: 'Tu reflejo', texto: 'Tres veces tu vida.' },
      {
        tipo: 'citas',
        items: [
          { etiqueta: 'Como salió primero', texto: t(r, 'v1') },
          { etiqueta: 'Desde lo que sobreviviste', texto: t(r, 'v2') },
          { etiqueta: 'Como la contaría alguien que te quiere', texto: t(r, 'v3') },
        ],
      },
      { tipo: 'parrafo', texto: lecturas[tono] ?? '' },
      { tipo: 'frase', etiqueta: 'La frase que te cuesta creer', texto: t(r, 'clave'), destacada: true },
      { tipo: 'parrafo', texto: 'Ahí hay trabajo. Y ahí hay algo verdadero que otra persona ve y tú todavía no.' },
      { tipo: 'cierre', texto: 'No eliges lo que te pasó. Eliges quién narra.' },
    ];
  },
  servicio: TERAPIA_INDIVIDUAL,
};

/* =====================================================================================================
   CONTIGO
   ===================================================================================================== */

const critica: Ejercicio = {
  id: 'critica',
  camino: 'Contigo',
  titulo: 'La voz que te habla por dentro',
  subtitulo: 'Lo que te dices, de dónde lo aprendiste y lo que le dirías a alguien que quieres.',
  descripcion:
    'Esa voz que te juzga antes que nadie: qué dice, cuándo sube, de qué cree que te protege. Y la prueba más simple: ¿le dirías eso a alguien que quieres?',
  teLlevas: 'Las frases de tu crítica interna, de qué te protege y una frase justa para responderle.',
  duracion: '12 a 15 minutos',
  intensidad: 'media',
  enfoque:
    'Basado en la investigación sobre autocompasión (Kristin Neff) y en el trabajo con la voz crítica interna. Preguntas propias.',
  fuentes: [
    { nombre: 'Neff, K. D. (2003), Self-compassion: an alternative conceptualization' },
    { nombre: 'Gilbert, P. (2009), The Compassionate Mind' },
  ],
  intro: [
    'Hay una voz que te habla antes de que hable nadie. Te dice que no fue suficiente, que siempre es lo mismo contigo, que a ver qué van a pensar. Lleva tanto tiempo ahí que ya no la oyes como una voz: la oyes como la verdad.',
    'Este ejercicio la pone en el papel para que puedas mirarla. No para callarla. Para dejar de ser la única que habla.',
  ],
  antes: ['Sé literal: escribe las frases como suenan por dentro, aunque sean duras.'],
  pasos: [
    {
      tipo: 'opciones',
      id: 'frases',
      titulo: '¿Qué te dice esa voz? Marca las que reconozcas.',
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
      titulo: '¿Cuándo sube de volumen?',
      multiple: true,
      min: 1,
      opciones: [
        'Cuando cometo un error',
        'Cuando descanso',
        'Cuando me comparo',
        'Cuando pido ayuda',
        'Frente al espejo',
        'Cuando digo que no',
        'Cuando me va bien',
        'De noche, antes de dormir',
        'Cuando alguien me critica',
      ],
    },
    {
      tipo: 'escala',
      id: 'volumen',
      titulo: 'Un día normal, ¿qué tan alto habla?',
      etiquetas: ['Apenas se oye', 'No se oye otra cosa'],
    },
    {
      tipo: 'texto',
      id: 'origen',
      titulo: '¿A quién se parece esa voz? ¿De dónde la aprendiste?',
      guia: 'A veces tiene el tono exacto de alguien. A veces es una mezcla.',
      min: 20,
      filas: 4,
    },
    {
      tipo: 'texto',
      id: 'protege',
      titulo: 'Por dura que sea, esa voz cree que te protege de algo. ¿De qué?',
      guia: 'De que te rechacen, de fallar delante de otros, de confiarte demasiado, de que te vuelvan a hacer daño…',
      min: 20,
      filas: 4,
    },
    {
      tipo: 'nota',
      id: 'amigo',
      titulo: 'Ahora imagina esto.',
      texto:
        'Alguien a quien quieres mucho llega y te cuenta exactamente lo que tú te dices. Mismas palabras, misma situación. Está delante de ti, esperando que digas algo.',
    },
    {
      tipo: 'texto',
      id: 'respuesta',
      titulo: '¿Qué le dirías?',
      guia: 'Escríbelo tal cual se lo dirías. Con el tono con el que le hablarías.',
      min: 60,
      filas: 6,
    },
    {
      tipo: 'marcar',
      id: 'justa',
      de: 'respuesta',
      titulo: 'Toca la frase que más te gustaría escuchar tú.',
    },
  ],
  reflejo: (r) => {
    const dichas = l(r, 'frases');
    return [
      { tipo: 'titulo', eyebrow: 'Tu reflejo', texto: 'La voz, y lo que tú le respondes.' },
      { tipo: 'chips', etiqueta: 'Lo que te dice', items: dichas },
      { tipo: 'medida', etiqueta: 'Volumen, un día normal', valor: n(r, 'volumen'), max: 10 },
      { tipo: 'chips', etiqueta: 'Cuándo sube', items: l(r, 'cuando') },
      { tipo: 'frase', etiqueta: 'De dónde la aprendiste', texto: t(r, 'origen') },
      { tipo: 'frase', etiqueta: 'De qué cree que te protege', texto: t(r, 'protege') },
      {
        tipo: 'columnas',
        izquierda: { titulo: 'A ti te dices', texto: comillas(dichas[0] ?? '') },
        derecha: { titulo: 'A alguien que quieres le dirías', texto: comillas(t(r, 'justa')) },
      },
      {
        tipo: 'parrafo',
        texto:
          'Es la misma situación y es la misma persona. Lo que cambia es el tono. La frase que marcaste no es más amable: es más justa.',
      },
      { tipo: 'cierre', texto: 'No tienes que callar esa voz. Tienes que dejar de ser la única que habla.' },
    ];
  },
  servicio: TERAPIA_INDIVIDUAL,
};

const evitar: Ejercicio = {
  id: 'evitar',
  camino: 'Contigo',
  titulo: 'Lo que llevas tiempo sin mirar',
  subtitulo: 'Lo que evitas, lo que haces en su lugar y lo que te cuesta.',
  descripcion:
    'Hay algo que llevas semanas o meses sin mirar de frente. Aquí le pones nombre, ves qué haces en vez de mirarlo y cuánto te cuesta. Y eliges un paso ridículamente pequeño.',
  teLlevas: 'El nombre de lo que evitas, lo que la evitación te cuesta y un primer paso con fecha.',
  duracion: '10 minutos',
  intensidad: 'media',
  enfoque:
    'Basado en el concepto de evitación experiencial de la terapia de aceptación y compromiso (ACT). Preguntas propias.',
  fuentes: [{ nombre: 'Hayes, S. C. et al. (1996), Experiential avoidance and behavioral disorders' }],
  intro: [
    'Evitar funciona. Por eso lo hacemos. Dejas de mirar la cosa y el malestar baja, un rato. Lo que nadie te dijo es que funciona solo al principio, y que lo que evitas no se hace más pequeño: se hace más viejo.',
    'Diez minutos para mirarlo de reojo. No para resolverlo hoy.',
  ],
  antes: ['Elige una sola cosa. Si hay varias, la que más te pese.'],
  pasos: [
    {
      tipo: 'opciones',
      id: 'que',
      titulo: 'Hay algo que llevas tiempo sin mirar de frente. ¿Qué es?',
      otra: true,
      opciones: [
        'Una conversación pendiente',
        'Una decisión que aplazo',
        'Una cita médica o un chequeo',
        'Una deuda o un papel',
        'Un duelo',
        'Lo que siento por alguien',
        'Una relación que no funciona',
        'Un sueño que sigo posponiendo',
        'Mi cuerpo',
        'Algo del pasado',
      ],
    },
    {
      tipo: 'texto',
      id: 'nombre',
      titulo: 'Ponle nombre.',
      guia: 'Una o dos frases, lo más concretas que puedas. Nadie va a leerlas.',
      min: 20,
      filas: 3,
    },
    {
      tipo: 'opciones',
      id: 'en_vez',
      titulo: '¿Qué haces en vez de mirarlo?',
      multiple: true,
      max: 3,
      min: 1,
      opciones: [
        'El teléfono',
        'Trabajar más',
        'Dormir',
        'Comer',
        'Limpiar, organizar, ocuparme',
        'Pelear por otras cosas',
        'Ayudar a todo el mundo',
        'Series, juegos',
        'Darle vueltas sin decidir',
        'Beber o fumar',
        'Salir, no parar en casa',
      ],
    },
    {
      tipo: 'texto',
      id: 'teme',
      titulo: 'Si lo miraras de frente, ¿qué temes que pase, o que sientas?',
      min: 20,
      filas: 4,
    },
    {
      tipo: 'escala',
      id: 'costo',
      titulo: '¿Cuánto te está costando no mirarlo?',
      guia: 'Sueño, paz, dinero, relaciones, salud.',
      etiquetas: ['Casi nada', 'Muchísimo'],
    },
    {
      tipo: 'texto',
      id: 'paso',
      titulo: 'El paso más pequeño posible hacia eso.',
      guia: 'Tan pequeño que dé casi vergüenza: buscar el número, abrir la carta, escribir la primera línea. Con día y hora.',
      min: 10,
      filas: 3,
    },
    {
      tipo: 'opciones',
      id: 'quien',
      titulo: '¿Quién podría saber que vas a darlo?',
      otra: true,
      opciones: ['Nadie, por ahora', 'Mi pareja', 'Una amiga o un amigo', 'Alguien de mi familia', 'Un profesional'],
    },
  ],
  reflejo: (r) => {
    const enVez = l(r, 'en_vez');
    const bloques: Bloque[] = [
      { tipo: 'titulo', eyebrow: 'Tu reflejo', texto: 'Lo que no estabas mirando.' },
      { tipo: 'frase', etiqueta: `Lo que evitas · ${t(r, 'que')}`, texto: t(r, 'nombre') },
      { tipo: 'chips', etiqueta: 'Lo que ocupa su lugar', items: enVez },
      { tipo: 'frase', etiqueta: 'Lo que temes encontrar', texto: t(r, 'teme') },
      { tipo: 'medida', etiqueta: 'Lo que te cuesta no mirarlo', valor: n(r, 'costo'), max: 10 },
      { tipo: 'frase', etiqueta: 'Tu primer paso', texto: t(r, 'paso'), destacada: true },
      { tipo: 'parrafo', texto: `Quién lo sabrá: ${t(r, 'quien').toLowerCase()}.` },
    ];
    if (enVez.includes('Beber o fumar')) {
      bloques.push({
        tipo: 'aviso',
        texto:
          'Si lo que usas para no mirar te está costando salud, dinero o relaciones, vale la pena hablarlo con alguien. No como juicio: como cuidado.',
      });
    }
    bloques.push({
      tipo: 'cierre',
      texto:
        'Lo que evitas no se hace más pequeño. Se hace más viejo. Hoy lo miraste de reojo; con eso basta para empezar.',
    });
    return bloques;
  },
  servicio: TERAPIA_INDIVIDUAL,
};

/* =====================================================================================================
   CON LOS DEMÁS
   ===================================================================================================== */

const PASOS_PAREJA = [
  'Reclamo, insisto, subo el tono',
  'Me callo y me alejo',
  'Explico y me defiendo',
  'Cedo para que pase rápido',
  'Saco algo de antes',
  'Me pongo frío o fría, como si nada',
];
const PASOS_OTRO = [
  'Reclama, insiste, sube el tono',
  'Se calla y se aleja',
  'Explica y se defiende',
  'Cede para que pase rápido',
  'Saca algo de antes',
  'Se pone frío o fría, como si nada',
];

const ciclo: Ejercicio = {
  id: 'ciclo',
  camino: 'Con los demás',
  titulo: 'Tu paso en el baile',
  subtitulo: 'El pleito que se repite en tu pareja, y tu parte en él.',
  descripcion:
    'Casi todas las parejas tienen un mismo pleito con distintos disfraces. No es sobre el dinero ni los platos: es un ciclo. Aquí miras tu paso, el de tu pareja y lo que casi nunca dices en voz alta.',
  teLlevas: 'Tu ciclo dibujado con tus palabras y la frase que cambiaría la conversación.',
  duracion: '12 a 15 minutos',
  intensidad: 'media',
  enfoque:
    'Basado en la idea del ciclo negativo de la terapia focalizada en las emociones (EFT, Sue Johnson) y en la teoría del apego adulto. Preguntas propias.',
  fuentes: [
    { nombre: 'Johnson, S. M. (2004), The Practice of Emotionally Focused Couple Therapy, 2.ª ed.' },
    { nombre: 'Mikulincer, M. y Shaver, P. R. (2016), Attachment in Adulthood' },
  ],
  intro: [
    'Cuando una pareja discute, casi nunca discute de lo que parece. Debajo del tono, de los reproches y de los silencios, hay dos personas haciendo cada una su paso de un baile que ya conocen: uno reclama, el otro se aleja; uno se aleja, el otro reclama más.',
    'Este ejercicio no es para saber quién tiene razón. Es para ver el baile. Y para decir, aunque sea aquí, lo que se queda debajo.',
  ],
  antes: [
    'Hazlo a solas, pensando en la última discusión que se repitió.',
    'Si en tu relación hay miedo físico, insultos constantes o control sobre tu dinero o tus salidas, esto no es un ciclo: es otra cosa, y mereces ayuda específica. Oficina de la Procuradora de las Mujeres, línea de 24 horas: 787-722-2977.',
  ],
  pasos: [
    {
      tipo: 'opciones',
      id: 'detonante',
      titulo: 'Piensa en la última discusión que se repitió. ¿Qué la encendió?',
      otra: true,
      opciones: [
        'Sentirme ignorado o ignorada',
        'Una crítica',
        'Sentir que todo cae sobre mí',
        'El teléfono',
        'El dinero',
        'La familia del otro',
        'La intimidad, o la falta de ella',
        'Una promesa que no se cumplió',
        'Los hijos',
        'El desorden, las tareas',
      ],
    },
    {
      tipo: 'opciones',
      id: 'mi_paso',
      titulo: 'Cuando empieza, ¿qué haces tú primero?',
      opciones: PASOS_PAREJA,
    },
    {
      tipo: 'opciones',
      id: 'su_paso',
      titulo: '¿Y qué hace tu pareja cuando tú haces eso?',
      opciones: PASOS_OTRO,
    },
    {
      tipo: 'opciones',
      id: 'superficie',
      titulo: 'Por fuera, en medio del ciclo, ¿qué se ve en ti?',
      multiple: true,
      max: 2,
      min: 1,
      opciones: ['Rabia', 'Frialdad', 'Sarcasmo', 'Lágrimas', 'Silencio', 'Control', 'Cansancio', 'Indiferencia'],
    },
    {
      tipo: 'opciones',
      id: 'fondo',
      titulo: 'Y por debajo, ¿qué sientes de verdad?',
      guia: 'Lo que casi nunca se ve.',
      multiple: true,
      max: 2,
      min: 1,
      opciones: [
        'Miedo a no importarle',
        'Soledad',
        'Que nunca es suficiente',
        'Miedo a que se vaya',
        'Que fallé',
        'Que soy invisible',
        'Que me controlan',
        'Vergüenza',
        'Miedo a que me hagan daño otra vez',
      ],
    },
    {
      tipo: 'texto',
      id: 'nunca_digo',
      titulo: 'Lo que casi nunca dices en voz alta en medio del ciclo:',
      min: 20,
      filas: 4,
      ayudas: ['Lo que necesito de ti es…', 'Me da miedo que…', 'Cuando te alejas, yo…', 'Cuando me reclamas, yo…'],
    },
    {
      tipo: 'texto',
      id: 'bien',
      titulo: 'Cuando están bien, ¿qué hace tu pareja que te hace sentir seguro o segura?',
      guia: 'Algo concreto. Lo que ya funciona.',
      min: 15,
      filas: 3,
    },
  ],
  reflejo: (r) => [
    { tipo: 'titulo', eyebrow: 'Tu reflejo', texto: 'El baile, visto desde fuera.' },
    {
      tipo: 'ciclo',
      pasos: [
        { etiqueta: 'Se enciende con', texto: t(r, 'detonante') },
        { etiqueta: 'Tú', texto: t(r, 'mi_paso') },
        { etiqueta: 'Tu pareja', texto: t(r, 'su_paso') },
        { etiqueta: 'Y tú sientes', texto: l(r, 'fondo').join(' y ').toLowerCase() },
      ],
    },
    {
      tipo: 'columnas',
      izquierda: { titulo: 'Por fuera se ve', texto: l(r, 'superficie').join(', ') },
      derecha: { titulo: 'Por debajo sientes', texto: l(r, 'fondo').join(', ') },
    },
    { tipo: 'frase', etiqueta: 'Lo que casi nunca dices', texto: t(r, 'nunca_digo'), destacada: true },
    {
      tipo: 'parrafo',
      texto:
        'Fíjate: lo de arriba es lo que tu pareja ve. Lo de abajo es lo que tú vives. El ciclo se interrumpe cuando uno de los dos dice lo de abajo en vez de actuar lo de arriba.',
    },
    { tipo: 'frase', etiqueta: 'Lo que ya funciona', texto: t(r, 'bien') },
    {
      tipo: 'cierre',
      texto: 'El enemigo no es tu pareja. Es el ciclo. Y a un ciclo se le puede poner nombre entre dos.',
    },
  ],
  servicio: TERAPIA_PAREJA,
};

const carta: Ejercicio = {
  id: 'carta',
  camino: 'Con los demás',
  titulo: 'La carta que no vas a enviar',
  subtitulo: 'Doce minutos de escritura sin filtro para alguien a quien no puedes decírselo.',
  descripcion:
    'Elige a quién: alguien que ya no está, alguien con quien no puedes hablar, tu yo de niño o niña. Escribe doce minutos sin parar y sin corregir. Después, una sola frase.',
  teLlevas: 'Lo que llevabas dentro, afuera. Y la frase que más te costó escribir.',
  duracion: '20 minutos',
  intensidad: 'honda',
  enfoque:
    'Combina la carta no enviada de la terapia Gestalt con el protocolo de escritura expresiva de James Pennebaker, uno de los ejercicios con más investigación en psicología.',
  fuentes: [
    { nombre: 'Pennebaker, J. W. y Beall, S. K. (1986), Confronting a traumatic event' },
    { nombre: 'Frattaroli, J. (2006), Experimental disclosure and its moderators: a meta-analysis' },
  ],
  intro: [
    'Hay cosas que no se pudieron decir. Porque la persona ya no está, porque no escucharía, porque eras muy pequeño o muy pequeña, porque todavía duele. Se quedan dentro, y lo que se queda dentro pesa.',
    'Esta carta no se envía. Se escribe. Doce minutos seguidos, sin corregir, sin cuidar la ortografía, sin pensar si tiene sentido. En los estudios de escritura expresiva, eso (escribir lo más hondo sin filtro) es lo que alivia. No el resultado: el acto.',
  ],
  antes: [
    'Busca un lugar donde nadie te interrumpa.',
    'Puede dejarte movido o movida un rato. Es normal, y suele pasar en un día o dos. Si lo que sale es más de lo que puedes sostener, para y habla hoy con alguien.',
    'No es para hacerlo si estás en crisis ahora mismo.',
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
        'A alguien que me hizo daño',
        'A alguien a quien hice daño',
        'A alguien a quien nunca le di las gracias de verdad',
      ],
    },
    {
      tipo: 'nota',
      id: 'reglas',
      titulo: 'Las reglas son pocas.',
      texto:
        'Doce minutos. No pares de escribir. No corrijas. No cuides la forma. Si te quedas en blanco, repite la última frase hasta que salga otra. Escribe lo que de verdad sientes y piensas sobre esa persona y sobre ti, lo más hondo que puedas ir. Nadie va a leerlo.',
    },
    {
      tipo: 'texto',
      id: 'carta',
      titulo: (r) => `${t(r, 'a_quien')}.`,
      guia: 'Doce minutos. Sin parar.',
      min: 300,
      filas: 14,
      minutos: 12,
      ayudas: [
        'Lo que nunca te dije fue…',
        'Lo que más me dolió…',
        'Lo que necesitaba de ti…',
        'Lo que quiero que sepas…',
        'Lo que me llevo de ti…',
      ],
    },
    {
      tipo: 'pausa',
      id: 'respira',
      titulo: 'Ya está afuera.',
      texto: 'Suelta el teléfono o el teclado un momento. Respira tres veces antes de releer.',
      respiracion: true,
    },
    {
      tipo: 'marcar',
      id: 'dificil',
      de: 'carta',
      titulo: 'Lee tu carta despacio. Toca la frase que más te costó escribir.',
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
        'Rabia',
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
      titulo: 'Termina esta frase: lo que necesito ahora, de mí, es…',
      min: 10,
      filas: 3,
    },
  ],
  reflejo: (r) => [
    { tipo: 'titulo', eyebrow: 'Tu reflejo', texto: 'Lo que llevabas dentro, afuera.' },
    { tipo: 'frase', etiqueta: 'La frase que más te costó escribir', texto: t(r, 'dificil'), destacada: true },
    { tipo: 'chips', etiqueta: 'Lo que sentiste', items: l(r, 'emocion') },
    { tipo: 'frase', etiqueta: 'Lo que necesitas ahora, de ti', texto: t(r, 'necesito') },
    { tipo: 'carta', titulo: `Tu carta · ${t(r, 'a_quien').toLowerCase()}`, texto: t(r, 'carta'), plegada: true },
    {
      tipo: 'aviso',
      texto:
        'Escribir sobre lo que duele puede dejarte movido o movida unas horas. En la investigación sobre escritura expresiva, el alivio suele llegar después. Si lo que salió pesa más de lo que puedes sostener, habla hoy con alguien de confianza o con un profesional.',
    },
    {
      tipo: 'cierre',
      texto: 'La carta no era para esa persona. Era para que lo que llevabas dentro tuviera un lugar afuera.',
    },
  ],
  servicio: TERAPIA_INDIVIDUAL,
};

const gracias: Ejercicio = {
  id: 'gracias',
  camino: 'Con los demás',
  titulo: 'Gracias con nombre',
  subtitulo: 'Una carta a alguien que cambió tu vida y nunca lo supo del todo.',
  descripcion:
    'Piensa en alguien que hizo algo por ti que te cambió, y a quien nunca se lo dijiste como merecía. Escríbele. Y decide qué hacer con la carta.',
  teLlevas: 'Una carta de gratitud lista para leer en voz alta, y la decisión de hacerlo.',
  duracion: '10 a 15 minutos',
  intensidad: 'suave',
  enfoque:
    'La «visita de gratitud» de Martin Seligman, uno de los ejercicios de psicología positiva con efectos más duraderos en los estudios.',
  fuentes: [
    { nombre: 'Seligman, M. E. P. et al. (2005), Positive psychology progress: empirical validation of interventions' },
  ],
  intro: [
    'Hay personas que te cambiaron la vida con un gesto que para ellas quizá fue pequeño: una frase en el momento justo, una puerta abierta, quedarse cuando todos se fueron. Casi nunca se lo dijimos como merecía.',
    'En los estudios sobre gratitud, escribir esa carta y leérsela a la persona en voz alta es lo que más mueve el bienestar, y durante más tiempo. También es lo que más miedo da. Van juntas.',
  ],
  antes: ['Elige a alguien vivo, si puedes. Si ya no está, la carta vale igual.'],
  pasos: [
    {
      tipo: 'texto',
      id: 'quien',
      titulo: 'Alguien que cambió tu vida para bien y nunca se lo dijiste del todo.',
      guia: 'Escribe su nombre.',
      min: 2,
      filas: 1,
    },
    {
      tipo: 'texto',
      id: 'que_hizo',
      titulo: (r) => `¿Qué hizo ${t(r, 'quien')}, concretamente?`,
      guia: 'Un momento, con detalles: dónde estaban, qué dijo, qué hizo.',
      min: 60,
      filas: 5,
    },
    {
      tipo: 'texto',
      id: 'sin',
      titulo: '¿Qué sería distinto en ti si no lo hubiera hecho?',
      min: 30,
      filas: 4,
    },
    {
      tipo: 'texto',
      id: 'carta',
      titulo: (r) => `Escríbele a ${t(r, 'quien')}.`,
      guia: 'Empieza con su nombre. Cuéntale lo que hizo, lo que cambió en ti y lo que sigues llevando de aquello.',
      min: 150,
      filas: 10,
      minutos: 8,
    },
    {
      tipo: 'opciones',
      id: 'entregar',
      titulo: '¿Qué vas a hacer con la carta?',
      opciones: [
        'Leérsela en persona',
        'Enviársela',
        'Llamar y leérsela',
        'Guardarla, por ahora',
        'Ya no está: leérsela igual, en voz alta',
      ],
    },
  ],
  reflejo: (r) => {
    const quien = t(r, 'quien');
    const entrega = t(r, 'entregar');
    const bloques: Bloque[] = [
      { tipo: 'titulo', eyebrow: 'Tu reflejo', texto: `Lo que ${quien} cambió en ti.` },
      { tipo: 'frase', etiqueta: 'Lo que hizo', texto: t(r, 'que_hizo') },
      { tipo: 'frase', etiqueta: 'Lo que sería distinto sin eso', texto: t(r, 'sin') },
      { tipo: 'carta', titulo: `Para ${quien}`, texto: t(r, 'carta') },
      { tipo: 'frase', etiqueta: 'Lo que vas a hacer con ella', texto: entrega, destacada: true },
    ];
    if (entrega === 'Guardarla, por ahora') {
      bloques.push({
        tipo: 'parrafo',
        texto:
          'Guardarla está bien. Pero fíjate: lo que más miedo da (leérsela) es también lo que más cambia. La carta puede esperar; la persona, a veces, no.',
      });
    }
    bloques.push({
      tipo: 'cierre',
      texto:
        'Decir gracias con nombre y con detalles es una de las pocas cosas que hacen bien a dos personas a la vez.',
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

/** Orden sugerido si alguien quiere hacerlos todos (de menos a más hondo, con el de pareja al final). */
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
  { si: 'Si tienes diez minutos y quieres algo claro', id: 'brecha' },
  { si: 'Si llevas tiempo cargando algo que no dijiste', id: 'carta' },
  { si: 'Si tu pareja y tú repiten el mismo pleito', id: 'ciclo' },
  { si: 'Si te tratas peor de lo que tratarías a nadie', id: 'critica' },
  { si: 'Si quieres saber para qué vives como vives', id: 'ochenta' },
  { si: 'Si quieres algo que te deje bien', id: 'gracias' },
];

export const textosEjercicios = {
  aviso:
    'Los ejercicios son herramientas de reflexión personal, no terapia ni diagnóstico. Están pensados para personas adultas que están razonablemente bien y quieren mirar más hondo. Si estás en crisis, no son para hoy.',
  privacidad:
    'Lo que escribes se queda en tu navegador, en este dispositivo, solo mientras la pestaña esté abierta: no se envía ni se guarda en ningún servidor. Si decides dejar tus datos para seguimiento, viaja únicamente tu nombre, tu contacto, el nombre del ejercicio y la fecha. Nunca lo que escribiste.',
  dispositivo:
    'Si usas una computadora compartida, borra lo que escribiste al terminar (hay un botón al final) o cierra la pestaña.',
} as const;
