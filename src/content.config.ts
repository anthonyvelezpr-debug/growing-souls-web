import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const temas = [
  'relaciones',
  'comunicacion',
  'emociones',
  'culpa',
  'perdon',
  'limites',
  'vulnerabilidad',
  'autoaceptacion',
  'narrativas',
  'ansiedad',
  'estres',
  'parejas',
] as const;

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tema: z.enum(temas),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    readingTime: z.number().optional(),
    cta: z
      .object({ label: z.string(), href: z.string() })
      .default({ label: 'Solicitar una cita', href: '/agenda/' }),
  }),
});

export const collections = { journal };
