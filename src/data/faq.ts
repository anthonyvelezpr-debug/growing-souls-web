/**
 * Preguntas frecuentes. Se muestran en acordeón (visibles para la persona) y se publican como FAQPage en los datos
 * estructurados, que es lo que Google y los asistentes de IA leen para responder preguntas sobre Growing Souls.
 *
 * Reglas: solo lo que consta en el sitio, en el CV de la Dra. o en su biografía pública. Nada de tarifas, planes
 * médicos ni licencia hasta tener el dato. Las respuestas admiten enlaces (<a>) y nada más.
 */

export interface Pregunta {
  q: string;
  a: string;
}

export interface GrupoFaq {
  id: string;
  titulo: string;
  intro?: string;
  items: Pregunta[];
}

const WHATSAPP = '787-461-9260';

export const faqGeneral: GrupoFaq = {
  id: 'general',
  titulo: 'Sobre Growing Souls',
  items: [
    {
      q: '¿Qué es Growing Souls?',
      a: 'Growing Souls es la práctica privada de psicología clínica de la Dra. Melanie Acevedo Vélez, PsyD, en Puerto Rico. Ofrece psicoterapia individual para adultos, terapia de pareja y talleres y conferencias de psicoeducación para empresas, organizaciones y comunidades.',
    },
    {
      q: '¿Quién es la Dra. Melanie Acevedo Vélez?',
      a: 'Es psicóloga clínica, con doctorado en Psicología Clínica (PsyD) de la Universidad Albizu, y fundadora de Growing Souls. Se ha formado en Terapia Cognitivo-Conductual y en el Método Gottman de terapia de pareja (Nivel 1), y tiene experiencia en terapia individual, de pareja y de familia, supervisión clínica y talleres comunitarios. <a href="/melanie/#trayectoria">Conoce su formación y trayectoria</a>.',
    },
    {
      q: '¿Qué servicios ofrece Growing Souls?',
      a: 'Tres servicios: <a href="/terapia-individual/">psicoterapia individual para adultos</a>, <a href="/parejas/">terapia de pareja</a> y <a href="/talleres-y-conferencias/">talleres y conferencias</a> de psicoeducación para grupos y organizaciones. Además, la sección <a href="/conocete-mejor/">Conócete mejor</a> ofrece cuestionarios validados y ejercicios guiados, gratuitos y confidenciales.',
    },
    {
      q: '¿Las sesiones son presenciales o en línea?',
      a: 'Las sesiones pueden ser presenciales o en línea, por videollamada. Al solicitar la cita indicas la modalidad que prefieres y se coordina contigo.',
    },
    {
      q: '¿Cómo solicito una cita con la Dra. Acevedo?',
      a: `Puedes <a href="/agenda/">completar el formulario de cita</a> o escribir por WhatsApp al ${WHATSAPP}. La Dra. Acevedo te responde para coordinar día, hora y modalidad.`,
    },
    {
      q: '¿Cómo es la primera sesión?',
      a: 'La primera sesión es para conocerse. Compartes lo que desees, a tu ritmo, y conversan sobre lo que te trae y lo que esperas del proceso. No necesitas llegar con todo claro ni con un diagnóstico.',
    },
    {
      q: '¿Con qué enfoques terapéuticos trabaja?',
      a: 'Con enfoques con respaldo científico: la Terapia Cognitivo-Conductual (TCC), el Método Gottman en terapia de pareja y la psicoeducación, desde una relación terapéutica colaborativa y de respeto. <a href="/mision-y-vision/#enfoques">Más sobre los enfoques</a>.',
    },
    {
      q: '¿Atiende a niños o adolescentes?',
      a: 'Growing Souls atiende a personas adultas y a parejas. Si buscas atención para un menor, puedes escribir y recibirás orientación sobre a dónde acudir.',
    },
    {
      q: '¿En qué idioma son las sesiones?',
      a: 'Las sesiones y los talleres son en español.',
    },
    {
      q: '¿Dónde está Growing Souls?',
      a: 'Growing Souls atiende a personas de todo Puerto Rico. Al coordinar la cita se confirma el lugar de la sesión o se envía el enlace de la videollamada.',
    },
    {
      q: '¿La información que comparto en terapia es confidencial?',
      a: 'Sí. Lo que compartes en terapia es confidencial, con las excepciones que establece la ley para proteger tu seguridad o la de otras personas. La Dra. Acevedo lo explica con detalle en la primera sesión.',
    },
    {
      q: '¿Qué hago si estoy en crisis?',
      a: 'Growing Souls no es un servicio de emergencias. Si estás en peligro o piensas en hacerte daño, llama ahora a la Línea PAS (1-800-981-0023 o 988), disponible las 24 horas, o al 911. <a href="/recursos/#lineas-de-ayuda">Ver todas las líneas de ayuda</a>.',
    },
  ],
};

export const faqIndividual: GrupoFaq = {
  id: 'terapia-individual',
  titulo: 'Terapia individual',
  items: [
    {
      q: '¿Para qué situaciones puedo buscar terapia individual?',
      a: 'Para ansiedad, depresión, estrés y agotamiento, duelo, cambios de vida, experiencias difíciles, baja autoestima, culpa, límites y dificultades en las relaciones, entre otras. No hace falta tener un diagnóstico ni una razón "suficientemente grave" para empezar.',
    },
    {
      q: '¿Cuánto dura un proceso de terapia?',
      a: 'Depende de cada persona y de lo que quiera trabajar. En la primera sesión se conversa sobre expectativas y, a lo largo del proceso, se revisan juntos los objetivos y el ritmo.',
    },
    {
      q: '¿Necesito un referido médico para empezar?',
      a: 'No. Puedes solicitar una cita directamente a través del formulario o por WhatsApp.',
    },
    {
      q: '¿Y si no sé por dónde empezar?',
      a: 'Es muy común. Puedes empezar por la primera sesión, que es precisamente para conocerse, o explorar antes los <a href="/conocete-mejor/">cuestionarios y ejercicios de Conócete mejor</a> y traer el resultado.',
    },
    {
      q: '¿La terapia individual puede ser en línea?',
      a: 'Sí. Las sesiones pueden ser presenciales o en línea por videollamada, según lo que prefieras y se coordine en la cita.',
    },
  ],
};

export const faqParejas: GrupoFaq = {
  id: 'terapia-de-pareja',
  titulo: 'Terapia de pareja',
  items: [
    {
      q: '¿Cuándo conviene buscar terapia de pareja?',
      a: 'Cuando las discusiones se repiten, cuesta comunicarse, hay distancia emocional, se quiere reconstruir la confianza después de una infidelidad, hay decisiones importantes por tomar o, simplemente, cuando quieren fortalecer la relación. No hace falta estar en crisis para empezar.',
    },
    {
      q: '¿Qué pasa si mi pareja no quiere ir a terapia?',
      a: 'Puedes comenzar con terapia individual para trabajar tu parte en la relación y la manera de plantear la conversación. Con frecuencia, ese primer paso abre la puerta a que la otra persona se sume más adelante.',
    },
    {
      q: '¿Cómo es la primera sesión de pareja?',
      a: 'Asisten los dos. Conversan sobre cómo llegaron hasta aquí, qué quiere cada uno y qué esperan del proceso. No hace falta estar de acuerdo para empezar.',
    },
    {
      q: '¿Trabaja con parejas que han pasado por una infidelidad?',
      a: 'Sí. La experiencia clínica de la Dra. Acevedo incluye la infidelidad, los problemas de comunicación y otras dificultades en la relación de pareja.',
    },
    {
      q: '¿Qué es el Método Gottman?',
      a: 'Es un enfoque de terapia de pareja basado en más de cuatro décadas de investigación de John y Julie Gottman sobre lo que hace que una relación funcione: la amistad, el manejo del conflicto y el significado compartido. La Dra. Acevedo completó la formación de Nivel 1 en este método.',
    },
    {
      q: '¿Y si hay violencia en la relación?',
      a: 'En ese caso la terapia de pareja no es el primer paso: lo primero es tu seguridad. La Oficina de la Procuradora de las Mujeres tiene una línea de orientación confidencial las 24 horas: 787-722-2977. <a href="/recursos/#lineas-de-ayuda">Más líneas de ayuda</a>.',
    },
  ],
};

export const faqTalleres: GrupoFaq = {
  id: 'talleres-y-conferencias',
  titulo: 'Talleres y conferencias',
  items: [
    {
      q: '¿Para quién son los talleres y conferencias?',
      a: 'Para empresas y equipos de trabajo, iglesias, asociaciones estudiantiles, organizaciones comunitarias, grupos de mujeres y profesionales de la salud, la educación y el servicio.',
    },
    {
      q: '¿Qué temas trabaja en los talleres?',
      a: 'Bienestar emocional, manejo del estrés, comunicación efectiva, amor propio y límites, inteligencia emocional y toma de decisiones, atención plena, el peso emocional de cuidar a otros, y crianza y redes sociales. Cada taller se diseña con el grupo, a partir de lo que ese equipo o comunidad necesita.',
    },
    {
      q: '¿Los talleres pueden ser en línea?',
      a: 'Sí. Pueden ser presenciales o en línea, y se adaptan al tamaño del grupo y al tiempo disponible.',
    },
    {
      q: '¿Cuánto dura un taller?',
      a: 'Se define con el grupo: desde una charla breve hasta un taller práctico de varias horas. El costo se cotiza según el formato, la duración y el tamaño del grupo.',
    },
    {
      q: '¿Cómo solicito un taller o una conferencia?',
      a: `Completa el <a href="/agenda/?tipo=taller">formulario de solicitud</a> indicando quién es el grupo y qué quieren lograr, o escribe por WhatsApp al ${WHATSAPP}. La Dra. Acevedo responde con una propuesta de tema, formato y duración.`,
    },
  ],
};

export const faqConocete: GrupoFaq = {
  id: 'conocete-mejor',
  titulo: 'Conócete mejor: cuestionarios y ejercicios',
  items: [
    {
      q: '¿Los cuestionarios de Conócete mejor dan un diagnóstico?',
      a: 'No. Son herramientas de orientación educativa. Un cuestionario breve no conoce tu historia ni tu contexto; un resultado alto no significa que tengas un trastorno, y uno bajo no descarta que necesites apoyo. Si algo te preocupa, lo mejor es conversarlo con un profesional.',
    },
    {
      q: '¿Qué cuestionarios incluye?',
      a: 'Cuatro instrumentos validados y de uso libre, en su versión oficial en español: bienestar (WHO-5), estado de ánimo (PHQ-9), ansiedad (GAD-7) y estrés (escala de estrés del DASS-21).',
    },
    {
      q: '¿Qué son los ejercicios guiados?',
      a: 'Diez ejercicios de reflexión y escritura inspirados en técnicas que se utilizan en psicoterapia (clarificación de valores, escritura expresiva, autocompasión, entre otras). Te acompañan paso a paso y terminan con un resumen de lo que escribiste.',
    },
    {
      q: '¿Son gratuitos? ¿Hay que registrarse?',
      a: 'Son gratuitos y no requieren registro. Lo que respondes o escribes se procesa en tu dispositivo y no se envía a ningún servidor.',
    },
    {
      q: '¿Puedo llevar mi resultado a la primera sesión?',
      a: 'Sí. Al final de cada cuestionario o ejercicio puedes imprimirlo o guardarlo en PDF para traerlo a tu primera cita.',
    },
  ],
};

export const gruposFaq: GrupoFaq[] = [faqGeneral, faqIndividual, faqParejas, faqTalleres, faqConocete];

/** Preguntas destacadas para la portada. */
export const faqPortada: Pregunta[] = [
  faqGeneral.items[0],
  faqGeneral.items[2],
  faqGeneral.items[3],
  faqGeneral.items[4],
  faqGeneral.items[5],
  faqGeneral.items[6],
];

/** Nodo FAQPage para los datos estructurados de una página. */
export const faqSchema = (items: Pregunta[], url: string) => ({
  '@type': 'FAQPage',
  '@id': `${url}#faq`,
  inLanguage: 'es-PR',
  mainEntity: items.map((p) => ({
    '@type': 'Question',
    name: p.q,
    acceptedAnswer: { '@type': 'Answer', text: p.a },
  })),
});
