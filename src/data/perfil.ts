/**
 * Formación y trayectoria de la Dra. Melanie Acevedo Vélez.
 *
 * Fuentes: su CV (Resume 2026, entregado por Anthony el 2 oct 2026) y su biografía publicada en HBN Academy
 * (academyhbn.com), que confirma el internado en Indiana y el tema de la disertación. No se publican datos personales
 * del CV (teléfono, correo personal ni dirección). Lo que no consta en esas fuentes no se afirma.
 */

export interface Grado {
  titulo: string;
  institucion: string;
  anio: string;
  honor?: string;
}

export const formacion: Grado[] = [
  {
    titulo: 'Doctorado en Psicología Clínica (PsyD)',
    institucion: 'Universidad Albizu, Mayagüez',
    anio: '2021',
    honor: 'Con distinción',
  },
  {
    titulo: 'Maestría en Ciencias en Psicología Clínica',
    institucion: 'Universidad Albizu, Mayagüez',
    anio: '2019',
    honor: 'Con distinción',
  },
  {
    titulo: 'Bachillerato en Artes en Psicología',
    institucion: 'Universidad de Puerto Rico, Recinto de Mayagüez',
    anio: '2016',
    honor: 'Cum laude',
  },
];

/** Datos de formación que no son grados. */
export const formacionDetalle = [
  'Disertación doctoral sobre la comunicación asertiva en el matrimonio.',
  'Internado clínico en una clínica comunitaria en Indiana, Estados Unidos, que amplió su experiencia multicultural.',
];

export const formacionClinica = ['Método Gottman de terapia de pareja, Nivel 1', 'Terapia Cognitivo-Conductual (TCC)'];

export interface Cargo {
  cargo: string;
  lugar: string;
  periodo: string;
  texto: string;
}

export const experiencia: Cargo[] = [
  {
    cargo: 'Fundadora y psicóloga clínica',
    lugar: 'Growing Souls, práctica privada',
    periodo: '2025 al presente',
    texto: 'Psicoterapia individual y de pareja para adultos, y talleres para empresas, iglesias y asociaciones estudiantiles.',
  },
  {
    cargo: 'Directora de Desarrollo Educativo y Manejo de Casos',
    lugar: 'Little Tree Foundation Inc.',
    periodo: '2024 al presente',
    texto:
      'Organización dedicada a atender la soledad y el aislamiento social en Puerto Rico. Coordina el manejo de casos y crea talleres abiertos a la comunidad para promover la salud mental.',
  },
  {
    cargo: 'Psicóloga',
    lugar: 'Umbrella of Purpose and Hope',
    periodo: '2022 al presente',
    texto: 'Terapia individual, de pareja y de familia con adolescentes y adultos.',
  },
  {
    cargo: 'Psicóloga',
    lugar: 'Holistika by Clínica Vitaliza',
    periodo: '2023 a 2024',
    texto: 'Terapia individual y de pareja con adultos.',
  },
  {
    cargo: 'Psicóloga',
    lugar: 'Instituto de Traumatología',
    periodo: '2022 a 2023',
    texto: 'Psicoterapia con niños y adolescentes, en colaboración con el Boys & Girls Club de Isabela.',
  },
  {
    cargo: 'Supervisora clínica',
    lugar: 'Universidad Albizu',
    periodo: '2022 a 2023',
    texto: 'Supervisión clínica de estudiantes de práctica de la maestría en consejería psicológica.',
  },
  {
    cargo: 'Instructora de Psicología Clínica y Salud Mental',
    lugar: 'HBN Academy',
    periodo: 'Actualidad',
    texto: 'Docencia en temas de psicología clínica y salud mental.',
  },
];

/** Experiencia clínica (según su CV), en lenguaje claro. */
export const experienciaClinica = [
  'Ansiedad',
  'Depresión',
  'Estrés postraumático',
  'Déficit de atención',
  'Procesos de adaptación',
  'Duelo',
  'Infidelidad y dificultades de pareja',
  'Estrategias de crianza',
];
