import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const archiveStatus = z.enum(["sealed", "active", "fragmentary", "withheld"]);

const baseEntry = {
  title: z.string(),
  summary: z.string(),
  status: archiveStatus.default("fragmentary"),
  date: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  provenance: z.string().optional(),
  contentNotes: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
};

const stories = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/stories" }),
  schema: z.object({
    ...baseEntry,
    sequence: z.number().int().positive().optional(),
    narrator: z.string().optional(),
  }),
});

const cases = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/cases" }),
  schema: z.object({
    ...baseEntry,
    caseCode: z.string(),
    location: z.string().optional(),
  }),
});

const characters = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/characters" }),
  schema: z.object({
    ...baseEntry,
    role: z.string(),
    firstAppearance: z.string().optional(),
  }),
});

const locations = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/locations" }),
  schema: z.object({
    ...baseEntry,
    region: z.string().optional(),
    classification: z.string().optional(),
  }),
});

const objects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/objects" }),
  schema: z.object({
    ...baseEntry,
    objectType: z.string().optional(),
    custody: z.string().optional(),
  }),
});

const mysteries = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/mysteries" }),
  schema: z.object({
    ...baseEntry,
    relatedCases: z.array(z.string()).default([]),
  }),
});

export const collections = {
  stories,
  cases,
  characters,
  locations,
  objects,
  mysteries,
};
