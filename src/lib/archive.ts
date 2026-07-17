import type { CollectionEntry } from "astro:content";

export const collectionLabels = {
  stories: "Stories",
  cases: "Cases",
  characters: "Characters",
  locations: "Locations",
  objects: "Objects",
  mysteries: "Mysteries",
} as const;

export type ArchiveCollection = keyof typeof collectionLabels;
export type ArchiveEntry = CollectionEntry<ArchiveCollection>;

export interface ArchiveLink {
  collection: ArchiveCollection;
  slug: string;
}

export interface NormalizedEntry {
  collection: ArchiveCollection;
  slug: string;
  title: string;
  summary: string;
  url: string;
  status: string;
  canonicalStatus: string;
  classification?: string;
  publicationYear?: string;
  timelineOrder?: number;
  publicationDate?: string;
  tags: string[];
  phenomenon: string[];
  entity: string[];
  locations: string[];
  evidenceType: string[];
  caseStatus: string;
  contentWarnings: string[];
}

const collectionOrder: ArchiveCollection[] = [
  "stories",
  "cases",
  "characters",
  "locations",
  "objects",
  "mysteries",
];

export const collectionPath = (collection: ArchiveCollection) => `/${collection}/`;

export const entrySlug = (entry: ArchiveEntry) =>
  entry.data.slug ?? entry.id.replace(/\.md$/, "").replace(/\\/g, "/");

export const entryUrl = (collection: ArchiveCollection, entry: ArchiveEntry) =>
  `${collectionPath(collection)}${entrySlug(entry)}/`;

export const isPublished = (entry: ArchiveEntry) => !entry.data.draft && entry.data.status !== "withheld";

export const sortEntries = (entries: ArchiveEntry[]) =>
  [...entries].sort((a, b) => {
    const aOrder = a.data.timelineOrder ?? Number.MAX_SAFE_INTEGER;
    const bOrder = b.data.timelineOrder ?? Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;
    const aDate = Number(a.data.publicationDate ?? a.data.date ?? 0);
    const bDate = Number(b.data.publicationDate ?? b.data.date ?? 0);
    if (aDate !== bDate) return aDate - bDate;
    return a.data.title.localeCompare(b.data.title);
  });

export const formatDate = (date?: Date) =>
  date?.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

export const formatLabel = (value: string) =>
  value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");

const directRelations: Record<ArchiveCollection, Partial<Record<ArchiveCollection, string[]>>> = {
  stories: { cases: ["cases"], characters: ["characters"], objects: ["objects"], mysteries: ["mysteries"] },
  cases: { stories: ["stories"], characters: ["characters"], objects: ["objects"], mysteries: ["mysteries"] },
  characters: { stories: ["stories"], cases: ["cases"], locations: ["locations"] },
  locations: { stories: ["stories"], cases: ["cases"], characters: ["characters"] },
  objects: { stories: ["stories"], cases: ["cases"], locations: ["locations"] },
  mysteries: { stories: ["stories"], cases: ["relatedCases"], characters: ["characters"], objects: ["objects"] },
};

export const explicitRelations = (collection: ArchiveCollection, entry: ArchiveEntry): ArchiveLink[] => {
  const links: ArchiveLink[] = [...entry.data.relatedEntries];
  const fields = directRelations[collection];

  for (const targetCollection of collectionOrder) {
    const fieldNames = fields[targetCollection] ?? [];
    for (const fieldName of fieldNames) {
      const values = (entry.data as unknown as Record<string, unknown>)[fieldName];
      if (Array.isArray(values)) {
        for (const slug of values) {
          if (typeof slug === "string") links.push({ collection: targetCollection, slug });
        }
      }
    }
  }

  return links;
};

export const normalizeEntry = (collection: ArchiveCollection, entry: ArchiveEntry): NormalizedEntry => {
  const publicationDate = entry.data.publicationDate ?? entry.data.date;
  return {
    collection,
    slug: entrySlug(entry),
    title: entry.data.title,
    summary: entry.data.summary,
    url: entryUrl(collection, entry),
    status: entry.data.status,
    canonicalStatus: entry.data.canonicalStatus,
    classification: entry.data.classification,
    publicationYear: publicationDate ? String(publicationDate.getFullYear()) : undefined,
    timelineOrder: entry.data.timelineOrder,
    publicationDate: publicationDate?.toISOString(),
    tags: entry.data.tags,
    phenomenon: entry.data.phenomenon,
    entity: entry.data.entity,
    locations: entry.data.locations,
    evidenceType: entry.data.evidenceType,
    caseStatus: entry.data.status,
    contentWarnings: entry.data.contentWarnings,
  };
};

export const relationshipKey = (collection: ArchiveCollection, slug: string) => `${collection}:${slug}`;

export const buildRelatedEntries = (
  currentCollection: ArchiveCollection,
  currentEntry: ArchiveEntry,
  allEntries: NormalizedEntry[],
  allRawEntries: Partial<Record<ArchiveCollection, ArchiveEntry[]>>,
) => {
  const currentSlug = entrySlug(currentEntry);
  const direct = new Set(
    explicitRelations(currentCollection, currentEntry).map((link) => relationshipKey(link.collection, link.slug)),
  );

  const inverse = new Set<string>();
  for (const collection of collectionOrder) {
    for (const entry of allRawEntries[collection] ?? []) {
      if (collection === currentCollection && entrySlug(entry) === currentSlug) continue;
      const links = explicitRelations(collection, entry);
      if (links.some((link) => link.collection === currentCollection && link.slug === currentSlug)) {
        inverse.add(relationshipKey(collection, entrySlug(entry)));
      }
    }
  }

  return allEntries.filter((entry) => direct.has(relationshipKey(entry.collection, entry.slug)) || inverse.has(relationshipKey(entry.collection, entry.slug)));
};

export const canonWarning = (entry: ArchiveEntry) => {
  const warnings = new Set<string>();
  if (entry.data.status === "fragmentary") warnings.add("Fragmentary");
  if (entry.data.status === "withheld") warnings.add("Withheld");
  if (entry.data.status === "active investigation") warnings.add("Active Investigation");
  if (entry.data.canonicalStatus === "provisional canon") warnings.add("Provisional Canon");
  if (entry.data.canonicalStatus === "established canon") warnings.add("Established Canon");
  return [...warnings];
};

export const taxonomyOptions = (entries: NormalizedEntry[]) => ({
  phenomenon: unique(entries.flatMap((entry) => entry.phenomenon)),
  entity: unique(entries.flatMap((entry) => entry.entity)),
  location: unique(entries.flatMap((entry) => entry.locations)),
  evidenceType: unique(entries.flatMap((entry) => entry.evidenceType)),
  caseStatus: unique(entries.map((entry) => entry.caseStatus)),
  publicationYear: unique(entries.map((entry) => entry.publicationYear).filter((year): year is string => Boolean(year))),
  tags: unique(entries.flatMap((entry) => entry.tags)),
});

const unique = (values: string[]) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
