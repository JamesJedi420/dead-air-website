import { getCollection } from "astro:content";
import {
  type ArchiveCollection,
  type ArchiveEntry,
  buildRelatedEntries,
  collectionLabels,
  entrySlug,
  isPublished,
  normalizeEntry,
  sortEntries,
} from "./archive";

export const archiveCollections = Object.keys(collectionLabels) as ArchiveCollection[];

export const getPublishedCollection = async (collection: ArchiveCollection) =>
  sortEntries((await getCollection(collection)).filter(isPublished) as ArchiveEntry[]);

export const getPublishedArchive = async () => {
  const entries = {} as Record<ArchiveCollection, ArchiveEntry[]>;

  for (const collection of archiveCollections) {
    entries[collection] = await getPublishedCollection(collection);
  }

  return entries;
};

export const getNormalizedArchive = async () => {
  const raw = await getPublishedArchive();
  return archiveCollections.flatMap((collection) =>
    raw[collection].map((entry) => normalizeEntry(collection, entry)),
  );
};

export const getEntryStaticPaths = async (collection: ArchiveCollection) => {
  const entries = await getPublishedCollection(collection);
  const raw = await getPublishedArchive();
  const normalized = archiveCollections.flatMap((item) =>
    raw[item].map((entry) => normalizeEntry(item, entry)),
  );
  const orderedStories = collection === "stories"
    ? entries.filter((entry) => typeof entry.data.timelineOrder === "number")
    : [];

  return entries.map((entry) => {
    const chronologyIndex = collection === "stories" && typeof entry.data.timelineOrder === "number"
      ? orderedStories.findIndex((orderedEntry) => entrySlug(orderedEntry) === entrySlug(entry))
      : -1;

    return {
      params: { slug: entrySlug(entry) },
      props: {
        collection,
        entry,
        relatedEntries: buildRelatedEntries(collection, entry, normalized, raw),
        previousEntry: chronologyIndex > 0
          ? normalizeEntry(collection, orderedStories[chronologyIndex - 1])
          : undefined,
        nextEntry: chronologyIndex >= 0 && chronologyIndex < orderedStories.length - 1
          ? normalizeEntry(collection, orderedStories[chronologyIndex + 1])
          : undefined,
      },
    };
  });
};
