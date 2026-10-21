import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Project schema
const projectSchema = z.object({
  title: z.string(),
  summary: z.string().max(140),
  year: z.number().int(),
  role: z.string(),
  status: z.enum(['live', 'demo', 'archived']),
  tier: z.enum(['case-study', 'list']),
  authorship: z.enum(['own', 'team', 'fork']),
  contribution: z.string().optional(),
  stack: z.array(z.string()).min(1),
  links: z.object({
    repo: z.string().url(),
    live: z.string().url().optional()
  }),
  disclosures: z.array(z.string()).default([]),
  metrics: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      evidence: z.string().url()
    })
  ).default([]),
  order: z.number().int()
});

// Experience schema
const experienceSchema = z.object({
  org: z.string(),
  role: z.string(),
  location: z.string().optional(),
  start: z.string().regex(/^\d{4}-\d{2}$/),
  end: z.union([z.literal('present'), z.string().regex(/^\d{4}-\d{2}$/)]),
  summary: z.string().max(160),
  bullets: z.array(z.string()).default([])
});

// Profile schema
const profileSchema = z.object({
  name: z.string(),
  descriptor: z.string(),
  intro: z.string(),
  email: z.string().email(),
  links: z.object({
    github: z.string().url(),
    linkedin: z.string().url(),
    x: z.string().url().optional()
  }),
  education: z.array(
    z.object({
      school: z.string(),
      program: z.string(),
      years: z.string(),
      cgpa: z.string().optional()
    })
  )
});

// Collections
export const collections = {
  work: defineCollection({
    loader: glob({ pattern: '**/*.mdx', base: './src/content/work' }),
    schema: projectSchema
  }),
  experience: defineCollection({
    loader: glob({ pattern: '**/*.mdx', base: './src/content/experience' }),
    schema: experienceSchema
  }),
  profile: defineCollection({
    loader: glob({ pattern: '**/*.mdx', base: './src/content/profile' }),
    schema: profileSchema
  })
};