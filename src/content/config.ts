import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    role: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

const testimonials = defineCollection({
  type: 'content',
  schema: z.object({
    quote: z.string(),
    author: z.string(),
    role: z.string(),
    company: z.string().optional(),
    order: z.number().default(99),
  }),
});

export const collections = {
  projects,
  testimonials,
};
