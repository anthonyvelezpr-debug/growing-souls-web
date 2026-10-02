/**
 * "Conócete mejor": autoevaluaciones breves basadas en instrumentos de uso libre.
 *
 * Reglas de esta colección (revisadas el 1 de octubre de 2026, fuentes en docs/instrumentos.md):
 * - Solo instrumentos de dominio público o con permiso expreso de reproducción, en su versión oficial en español.
 * - Nada aquí es un diagnóstico. Los textos de resultado lo dicen con claridad y sin alarmar.
 * - Las respuestas no salen del dispositivo. Si la persona deja sus datos, solo viaja la puntuación total y el rango.
 * - El ítem 9 del PHQ-9 (ideas de muerte o de hacerse daño) activa un flujo de seguridad con recursos inmediatos.
 *
 * Las definiciones son datos puros (sin funciones) para poder serializarlas a la página y usarlas en el navegador.
 */

export interface Opcion {
  label: string;
  value: number;
}

export interface Item {
  texto: string;
  /** Ítem de seguridad: cualquier respuesta distinta de 0 muestra recursos de ayuda inmediata. */
  seguridad?: boolean;
}

export interface Banda {
  /** Puntuación máxima (inclusive) de la banda, en la escala final. */
  hasta: number;
  /** Etiqueta del rango según el instrumento (p. ej. "Moderado"). */
  etiqueta: string;
  /** Titular en lenguaje humano. */
  titulo: string;
  /** Explicación breve, sin diagnóstico. */
  texto: string;
  /** Tono visual del resultado. */
  nivel: 'bien' | 'leve' | 'medio' | 'alto';
  /** Si es true, el resultado sugiere una evaluación profesional más completa. */
  evaluar?: boolean;
}

export interface Instrumento {
  id: string;
  /** Área en una o dos palabras, para la tarjeta. */
  area: string;
  /** Título en lenguaje humano. */
  titulo: string;
  /** Qué explora, en una frase. */
  explora: string;
  /** Texto de la tarjeta. */
  descripcion: string;
  duracion: string;
  /** Periodo al que se refieren las preguntas. */
  periodo: string;
  instruccion: string;
  opciones: Opcion[];
  items: Item[];
  puntuacion: {
    /** Multiplicador sobre la suma de respuestas (WHO-5 ×4, DASS-21 ×2). */
    multiplicador: number;
    max: number;
    /** Cómo se lee la escala final, p. ej. "de 0 a 100". */
    escala: string;
    /** Si es true, más puntos = mejor (WHO-5). */
    positivo?: boolean;
  };
  bandas: Banda[];
  recomendaciones: string[];
  fuente: {
    nombre: string;
    autores: string;
    version: string;
    licencia: string;
    url: string;
  };
  /** Servicio relacionado para el cierre del resultado. */
  servicio: { label: string; href: string };
}

const FRECUENCIA_2_SEMANAS: Opcion[] = [
  { label: 'Ningún día', value: 0 },
  { label: 'Varios días', value: 1 },
  { label: 'Más de la mitad de los días', value: 2 },
  { label: 'Casi todos los días', value: 3 },
];

export const evaluaciones: Instrumento[] = [
  {
    id: 'bienestar',
    area: 'Bienestar',
    titulo: '¿Cómo te has sentido estas dos semanas?',
    explora: 'Ánimo, calma, energía, descanso e interés por la vida cotidiana.',
    descripcion:
      'Cinco afirmaciones sobre cómo te has sentido en los últimos catorce días. Es la mirada más amplia y amable de la colección: un buen punto de partida.',
    duracion: '2 minutos',
    periodo: 'las dos últimas semanas',
    instruccion:
      'Por favor indique para cada una de las cinco afirmaciones cuál se acerca más a cómo se ha sentido durante las dos últimas semanas.',
    opciones: [
      { label: 'Todo el tiempo', value: 5 },
      { label: 'La mayor parte del tiempo', value: 4 },
      { label: 'Más de la mitad del tiempo', value: 3 },
      { label: 'Menos de la mitad del tiempo', value: 2 },
      { label: 'De vez en cuando', value: 1 },
      { label: 'Nunca', value: 0 },
    ],
    items: [
      { texto: 'Me he sentido alegre y de buen humor.' },
      { texto: 'Me he sentido tranquilo y relajado.' },
      { texto: 'Me he sentido activo y enérgico.' },
      { texto: 'Me he despertado fresco y descansado.' },
      { texto: 'Mi vida cotidiana ha estado llena de cosas que me interesan.' },
    ],
    puntuacion: { multiplicador: 4, max: 100, escala: 'de 0 a 100', positivo: true },
    bandas: [
      {
        hasta: 28,
        etiqueta: 'Bienestar bajo',
        titulo: 'Tu bienestar ha estado bajo estas dos semanas.',
        texto:
          'Una puntuación como esta indica que, la mayor parte del tiempo, te has sentido con poco ánimo, poca calma o poca energía. No dice por qué ni qué significa en tu caso. Sí es una señal clara para hablarlo con un profesional: no para alarmarte, sino para no cargar con esto sin apoyo.',
        nivel: 'alto',
        evaluar: true,
      },
      {
        hasta: 51,
        etiqueta: 'Bienestar reducido',
        titulo: 'Tu bienestar ha estado por debajo de lo habitual.',
        texto:
          'Quienes responden así suelen llevar días con menos energía, menos descanso o menos cosas que les interesen. A veces es una temporada; a veces es algo que lleva tiempo pidiendo atención. Vale la pena mirarlo con calma y, si se sostiene, hablarlo con alguien de confianza o con un profesional.',
        nivel: 'medio',
        evaluar: true,
      },
      {
        hasta: 100,
        etiqueta: 'Bienestar en rango habitual',
        titulo: 'Tu bienestar está en un rango habitual.',
        texto:
          'En estas dos semanas has tenido, con alguna frecuencia, momentos de ánimo, calma, energía y descanso. No significa que todo esté perfecto: significa que hay una base desde donde cuidar lo que quieras cuidar.',
        nivel: 'bien',
      },
    ],
    recomendaciones: [
      'Protege el descanso: acostarte y levantarte a horas parecidas ayuda más de lo que parece.',
      'Mueve el cuerpo un poco cada día, aunque sea una caminata corta.',
      'Busca una conversación real con alguien de confianza esta semana.',
      'Haz espacio, aunque sea breve, para algo que te interese de verdad.',
    ],
    fuente: {
      nombre: 'WHO-5 · Índice de Bienestar de la OMS',
      autores: 'Organización Mundial de la Salud / Psychiatric Research Unit, Hillerød',
      version: 'Versión oficial en español (1998)',
      licencia: 'De uso libre y gratuito; no requiere permiso.',
      url: 'https://www.psykiatri-regionh.dk/who-5/',
    },
    servicio: { label: 'Conoce la terapia individual', href: '/terapia-individual/' },
  },

  {
    id: 'animo',
    area: 'Estado de ánimo',
    titulo: '¿Cómo ha estado tu ánimo?',
    explora: 'Síntomas de ánimo bajo: interés, energía, sueño, apetito y cómo te ves a ti mismo.',
    descripcion:
      'Nueve preguntas sobre las últimas dos semanas. Es el cuestionario breve de ánimo más usado por profesionales de la salud en todo el mundo.',
    duracion: '3 minutos',
    periodo: 'las dos últimas semanas',
    instruccion: 'Durante las últimas 2 semanas, ¿qué tan seguido ha tenido molestias debido a los siguientes problemas?',
    opciones: FRECUENCIA_2_SEMANAS,
    items: [
      { texto: 'Poco interés o placer en hacer cosas.' },
      { texto: 'Se ha sentido decaído(a), deprimido(a) o sin esperanzas.' },
      { texto: 'Ha tenido dificultad para quedarse o permanecer dormido(a), o ha dormido demasiado.' },
      { texto: 'Se ha sentido cansado(a) o con poca energía.' },
      { texto: 'Sin apetito o ha comido en exceso.' },
      {
        texto:
          'Se ha sentido mal con usted mismo(a), o que es un fracaso, o que ha quedado mal con usted mismo(a) o con su familia.',
      },
      { texto: 'Ha tenido dificultad para concentrarse en ciertas actividades, tales como leer el periódico o ver la televisión.' },
      {
        texto:
          '¿Se ha movido o hablado tan lento que otras personas podrían haberlo notado? O lo contrario: muy inquieto(a) o agitado(a), moviéndose mucho más de lo normal.',
      },
      { texto: 'Pensamientos de que estaría mejor muerto(a) o de lastimarse de alguna manera.', seguridad: true },
    ],
    puntuacion: { multiplicador: 1, max: 27, escala: 'de 0 a 27' },
    bandas: [
      {
        hasta: 4,
        etiqueta: 'Mínimo',
        titulo: 'Tus respuestas apuntan a síntomas mínimos de ánimo bajo.',
        texto:
          'En estas dos semanas, las molestias que describe este cuestionario han estado poco presentes. Eso no borra los días difíciles que puedas haber tenido; dice que, en conjunto, el ánimo ha estado sosteniéndose.',
        nivel: 'bien',
      },
      {
        hasta: 9,
        etiqueta: 'Leve',
        titulo: 'Tus respuestas apuntan a síntomas leves de ánimo bajo.',
        texto:
          'Hay algunas señales presentes varios días: quizás menos energía, peor sueño o menos ganas. Muchas personas pasan por temporadas así. Conviene observarlo durante las próximas semanas y cuidarte un poco más de lo habitual.',
        nivel: 'leve',
      },
      {
        hasta: 14,
        etiqueta: 'Moderado',
        titulo: 'Tus respuestas apuntan a síntomas moderados de ánimo bajo.',
        texto:
          'Las molestias han estado presentes con bastante frecuencia. En este rango, hablar con un profesional de la salud mental suele ayudar a entender qué está pasando y qué puede aliviarlo. No es una emergencia; es una buena razón para pedir una cita.',
        nivel: 'medio',
        evaluar: true,
      },
      {
        hasta: 19,
        etiqueta: 'Moderadamente grave',
        titulo: 'Tus respuestas apuntan a síntomas marcados de ánimo bajo.',
        texto:
          'Lo que describes ha estado presente la mayor parte de los días y probablemente está pesando en tu rutina. Este resultado amerita una evaluación profesional más completa. Pedirla no es exagerar: es la manera más corta de empezar a sentirte mejor.',
        nivel: 'alto',
        evaluar: true,
      },
      {
        hasta: 27,
        etiqueta: 'Grave',
        titulo: 'Tus respuestas apuntan a síntomas intensos de ánimo bajo.',
        texto:
          'Has estado cargando mucho casi todos los días. Este resultado amerita hablar pronto con un profesional de la salud mental, y si en algún momento sientes que no puedes más, hay ayuda inmediata las 24 horas. No tienes que resolverlo solo o sola.',
        nivel: 'alto',
        evaluar: true,
      },
    ],
    recomendaciones: [
      'Mantén, aunque cueste, una rutina mínima: hora de levantarte, comidas y algo de luz natural.',
      'Reduce lo que esperas de ti esta semana; haz menos cosas, pero hazlas.',
      'Dile a una persona de confianza cómo has estado. Ponerlo en palabras ya alivia.',
      'Si notas que el ánimo bajo lleva más de dos semanas, consulta con un profesional.',
    ],
    fuente: {
      nombre: 'PHQ-9 · Cuestionario de Salud del Paciente',
      autores: 'Spitzer, Williams, Kroenke y colegas, con una beca educativa de Pfizer Inc.',
      version: 'Versión oficial en español (Spanish for the USA)',
      licencia: 'No se requiere permiso para reproducir, traducir, presentar o distribuir.',
      url: 'https://www.phqscreeners.com/',
    },
    servicio: { label: 'Conoce la terapia individual', href: '/terapia-individual/' },
  },

  {
    id: 'ansiedad',
    area: 'Ansiedad',
    titulo: '¿Cuánto espacio ha ocupado la preocupación?',
    explora: 'Nerviosismo, preocupación difícil de controlar, inquietud e irritabilidad.',
    descripcion:
      'Siete preguntas sobre las últimas dos semanas. Un cuestionario breve y bien estudiado para mirar la ansiedad con claridad.',
    duracion: '2 minutos',
    periodo: 'las dos últimas semanas',
    instruccion: 'Durante las últimas 2 semanas, ¿qué tan seguido ha tenido molestias debido a los siguientes problemas?',
    opciones: FRECUENCIA_2_SEMANAS,
    items: [
      { texto: 'Se ha sentido nervioso(a), ansioso(a) o con los nervios de punta.' },
      { texto: 'No ha sido capaz de parar o controlar su preocupación.' },
      { texto: 'Se ha preocupado demasiado por motivos diferentes.' },
      { texto: 'Ha tenido dificultad para relajarse.' },
      { texto: 'Se ha sentido tan inquieto(a) que no ha podido quedarse quieto(a).' },
      { texto: 'Se ha molestado o irritado fácilmente.' },
      { texto: 'Ha tenido miedo de que algo terrible fuera a pasar.' },
    ],
    puntuacion: { multiplicador: 1, max: 21, escala: 'de 0 a 21' },
    bandas: [
      {
        hasta: 4,
        etiqueta: 'Mínima',
        titulo: 'Tus respuestas apuntan a una ansiedad mínima.',
        texto:
          'La preocupación y el nerviosismo han estado poco presentes estas dos semanas. Sentir ansiedad en momentos puntuales es parte de estar vivo; lo que mide este cuestionario es cuánto se ha quedado.',
        nivel: 'bien',
      },
      {
        hasta: 9,
        etiqueta: 'Leve',
        titulo: 'Tus respuestas apuntan a una ansiedad leve.',
        texto:
          'Algunas señales han aparecido varios días: quizás te cuesta relajarte o la preocupación se queda más tiempo del que quisieras. Suele ayudar observar qué la dispara y darle al cuerpo pausas reales.',
        nivel: 'leve',
      },
      {
        hasta: 14,
        etiqueta: 'Moderada',
        titulo: 'Tus respuestas apuntan a una ansiedad moderada.',
        texto:
          'La preocupación ha estado presente con bastante frecuencia y probablemente te está costando energía. En este rango, una evaluación con un profesional de la salud mental puede ayudarte a entender qué la sostiene y cómo bajarle el volumen.',
        nivel: 'medio',
        evaluar: true,
      },
      {
        hasta: 21,
        etiqueta: 'Grave',
        titulo: 'Tus respuestas apuntan a una ansiedad intensa.',
        texto:
          'Lo que describes ha estado presente casi todos los días. Vivir así cansa mucho, y no tiene por qué seguir igual: la ansiedad responde bien a la terapia. Este resultado amerita una evaluación profesional más completa.',
        nivel: 'alto',
        evaluar: true,
      },
    ],
    recomendaciones: [
      'Cuando la preocupación suba, vuelve a los sentidos: cinco cosas que ves, cuatro que sientes, tres que escuchas, dos que hueles, una que saboreas.',
      'Alarga la exhalación: inhala en cuatro tiempos, exhala en seis, durante un par de minutos.',
      'Reduce cafeína y pantallas en las últimas horas del día.',
      'Escribe la preocupación en papel y ponle una hora concreta para pensarla.',
    ],
    fuente: {
      nombre: 'GAD-7 · Escala de Ansiedad Generalizada',
      autores: 'Spitzer, Williams, Kroenke y colegas, con una beca educativa de Pfizer Inc.',
      version: 'Versión oficial en español (Spanish for the USA)',
      licencia: 'No se requiere permiso para reproducir, traducir, presentar o distribuir.',
      url: 'https://www.phqscreeners.com/',
    },
    servicio: { label: 'Conoce la terapia individual', href: '/terapia-individual/' },
  },

  {
    id: 'estres',
    area: 'Estrés',
    titulo: '¿Cuánto te ha pesado la tensión esta semana?',
    explora: 'Dificultad para relajarte, nervios, irritabilidad e impaciencia.',
    descripcion:
      'Siete afirmaciones sobre la última semana, tomadas de la escala de estrés del DASS-21. Breve, directa y pensada para adultos.',
    duracion: '2 minutos',
    periodo: 'la última semana',
    instruccion:
      'Por favor lea las siguientes afirmaciones e indique cuánto se le aplicó cada una durante la semana pasada. No hay respuestas correctas o incorrectas. No tome demasiado tiempo para contestar.',
    opciones: [
      { label: 'No me aplicó', value: 0 },
      { label: 'Me aplicó un poco, o durante parte del tiempo', value: 1 },
      { label: 'Me aplicó bastante, o durante una buena parte del tiempo', value: 2 },
      { label: 'Me aplicó mucho, o la mayor parte del tiempo', value: 3 },
    ],
    items: [
      { texto: 'Me costó mucho relajarme.' },
      { texto: 'Reaccioné exageradamente en ciertas situaciones.' },
      { texto: 'Sentí que tenía muchos nervios.' },
      { texto: 'Noté que me agitaba.' },
      { texto: 'Se me hizo difícil relajarme.' },
      { texto: 'No toleré nada que no me permitiera continuar con lo que estaba haciendo.' },
      { texto: 'Sentí que estaba muy irritable.' },
    ],
    puntuacion: { multiplicador: 2, max: 42, escala: 'de 0 a 42' },
    bandas: [
      {
        hasta: 14,
        etiqueta: 'Normal',
        titulo: 'Tu nivel de estrés está dentro de lo habitual.',
        texto:
          'Esta semana la tensión ha estado presente en una medida que la mayoría de las personas reconoce como normal. Eso no significa que no haya habido momentos pesados; dice que no se han quedado instalados.',
        nivel: 'bien',
      },
      {
        hasta: 18,
        etiqueta: 'Leve',
        titulo: 'Tu nivel de estrés ha estado un poco por encima de lo habitual.',
        texto:
          'Hay señales de tensión acumulada: cuesta más relajarse o la paciencia se acaba antes. Suele ser una buena semana para revisar qué estás cargando y qué puedes soltar o repartir.',
        nivel: 'leve',
      },
      {
        hasta: 25,
        etiqueta: 'Moderado',
        titulo: 'Tu nivel de estrés ha estado moderadamente alto.',
        texto:
          'La tensión ha ocupado una buena parte de la semana y probablemente se nota en el cuerpo, en el sueño o en el trato con los demás. Si lleva tiempo así, hablarlo con un profesional ayuda a encontrar dónde está la carga y cómo bajarla.',
        nivel: 'medio',
        evaluar: true,
      },
      {
        hasta: 33,
        etiqueta: 'Severo',
        titulo: 'Tu nivel de estrés ha estado alto.',
        texto:
          'Lo que describes se parece a vivir en alerta la mayor parte del tiempo. Nadie sostiene eso indefinidamente sin desgaste. Este resultado amerita una evaluación profesional más completa y, sobre todo, un plan para repartir el peso.',
        nivel: 'alto',
        evaluar: true,
      },
      {
        hasta: 42,
        etiqueta: 'Extremadamente severo',
        titulo: 'Tu nivel de estrés ha estado muy alto.',
        texto:
          'La tensión ha estado presente casi todo el tiempo y con mucha intensidad. Es importante que no sigas así en soledad: un profesional de la salud mental puede ayudarte a entender qué está pasando y a bajar la carga paso a paso.',
        nivel: 'alto',
        evaluar: true,
      },
    ],
    recomendaciones: [
      'Pon por escrito todo lo que estás cargando y marca qué depende de ti y qué no.',
      'Protege una pausa real al día, sin pantalla, aunque sean diez minutos.',
      'Muévete: caminar, estirar o cualquier actividad que descargue el cuerpo.',
      'Di que no a una cosa esta semana. Una sola. Observa qué pasa.',
    ],
    fuente: {
      nombre: 'DASS-21 · escala de estrés',
      autores: 'Lovibond & Lovibond (UNSW). Traducción al español de Daza, Novy, Stanley y Averill (2002)',
      version: 'Versión en español validada con población hispana en Estados Unidos',
      licencia: 'Instrumento de dominio público.',
      url: 'https://www2.psy.unsw.edu.au/dass/',
    },
    servicio: { label: 'Conoce la terapia individual', href: '/terapia-individual/' },
  },
];

export const getEvaluacion = (id: string) => evaluaciones.find((e) => e.id === id);

/** Textos compartidos por todas las autoevaluaciones. */
export const textos = {
  aviso:
    'Estas herramientas son educativas y de orientación. No son un diagnóstico, una evaluación clínica ni un sustituto de la consulta con un profesional de la salud mental. Están pensadas para personas adultas.',
  limitaciones:
    'Un cuestionario breve no conoce tu historia, tu contexto ni lo que has vivido estas semanas: solo recoge cómo respondiste hoy. Un resultado alto no significa que tengas un trastorno, y uno bajo no descarta que necesites apoyo. Si algo de lo que leíste te preocupa, lo mejor es hablarlo con un profesional.',
  privacidad:
    'Tus respuestas no salen de tu dispositivo ni se guardan en ningún servidor. Si decides dejar tus datos para recibir seguimiento, solo se envía tu nombre, tu contacto, el nombre de la autoevaluación, la fecha, la puntuación total y el rango.',
  seguridad: {
    titulo: 'Antes de seguir, una pausa.',
    texto:
      'Gracias por responder con honestidad; esa pregunta es importante. Si en este momento estás pensando en hacerte daño, no esperes a terminar esto: hay personas disponibles ahora mismo, a cualquier hora, en español y de forma gratuita.',
    cierre: 'Si estás a salvo y quieres continuar, puedes hacerlo cuando estés listo o lista.',
  },
} as const;
