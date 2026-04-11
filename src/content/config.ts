import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      role: z.string().optional(),
      featured: z.boolean().default(false),
      listOnWorkPage: z.boolean().default(true),
      caseStudyComingSoon: z.boolean().default(false),
      order: z.number().default(99),
      thumbnail: image().optional(),
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

const failureStories = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    role: z.string().optional(),
    order: z.number().default(99),
    caseStudyComingSoon: z.boolean().default(false),
  }),
});

export const collections = {
  projects,
  testimonials,
  failureStories,
};
