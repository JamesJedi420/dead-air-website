import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const archiveStatus = z.enum([
  "sealed",
  "active",
  "fragmentary",
  "withheld",
  "active investigation",
]);
const canonicalStatus = z.enum([
  "provisional canon",
  "established canon",
  "withheld",
  "non-canon",
]);
const datePrecision = z.enum(["exact", "approximate", "seasonal", "relative"]);
const relatedEntry = z.object({
  collection: z.enum(["stories", "cases", "characters", "locations", "objects", "mysteries"]),
  slug: z.string(),
});

const baseEntry = {
  slug: z.string().optional(),
  title: z.string(),
  summary: z.string(),
  status: archiveStatus.default("fragmentary"),
  classification: z.string().optional(),
  firstAppearance: z.string().optional(),
  lastAppearance: z.string().optional(),
  relatedEntries: z.array(relatedEntry).default([]),
  contentWarnings: z.array(z.string()).default([]),
  readingTime: z.string().optional(),
  timelineOrder: z.number().optional(),
  timelineLabel: z.string().optional(),
  sourceOrder: z.string().optional(),
  datePrecision: datePrecision.optional(),
  chronologyNote: z.string().optional(),
  follows: z.array(relatedEntry).default([]),
  precedes: z.array(relatedEntry).default([]),
  publicationDate: z.coerce.date().optional(),
  revision: z.string().optional(),
  canonicalStatus: canonicalStatus.default("provisional canon"),
  date: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  phenomenon: z.array(z.string()).default([]),
  entity: z.array(z.string()).default([]),
  locations: z.array(z.string()).default([]),
  evidenceType: z.array(z.string()).default([]),
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
    cases: z.array(z.string()).default([]),
    characters: z.array(z.string()).default([]),
    objects: z.array(z.string()).default([]),
    mysteries: z.array(z.string()).default([]),
    coverImage: z.string().optional(),
    coverAlt: z.string().optional(),
  }),
});

const cases = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/cases" }),
  schema: z.object({
    ...baseEntry,
    caseCode: z.string(),
    location: z.string().optional(),
    characters: z.array(z.string()).default([]),
    stories: z.array(z.string()).default([]),
    objects: z.array(z.string()).default([]),
    mysteries: z.array(z.string()).default([]),
  }),
});

const characters = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/characters" }),
  schema: z.object({
    ...baseEntry,
    role: z.string(),
    firstAppearance: z.string().optional(),
    stories: z.array(z.string()).default([]),
    cases: z.array(z.string()).default([]),
    locations: z.array(z.string()).default([]),
  }),
});

const locations = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/locations" }),
  schema: z.object({
    ...baseEntry,
    region: z.string().optional(),
    classification: z.string().optional(),
    cases: z.array(z.string()).default([]),
    stories: z.array(z.string()).default([]),
    characters: z.array(z.string()).default([]),
  }),
});

const objects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/objects" }),
  schema: z.object({
    ...baseEntry,
    objectType: z.string().optional(),
    custody: z.string().optional(),
    stories: z.array(z.string()).default([]),
    cases: z.array(z.string()).default([]),
    locations: z.array(z.string()).default([]),
  }),
});

const mysteries = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/mysteries" }),
  schema: z.object({
    ...baseEntry,
    relatedCases: z.array(z.string()).default([]),
    stories: z.array(z.string()).default([]),
    characters: z.array(z.string()).default([]),
    objects: z.array(z.string()).default([]),
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