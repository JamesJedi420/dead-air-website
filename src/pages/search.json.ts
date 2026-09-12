import { collectionLabels, formatLabel } from "../lib/archive";
import { getNormalizedArchive } from "../lib/loadArchive";

export async function GET() {
  const entries = (await getNormalizedArchive()).map((entry) => ({
    collection: collectionLabels[entry.collection],
    title: entry.title,
    summary: entry.summary,
    url: entry.url,
    tags: entry.tags,
    phenomenon: entry.phenomenon,
    entity: entry.entity,
    locations: entry.locations,
    evidenceType: entry.evidenceType,
    status: formatLabel(entry.status),
    canonicalStatus: formatLabel(entry.canonicalStatus),
    coverImage: entry.coverImage,
    coverAlt: entry.coverAlt,
    readingTime: entry.readingTime,
    publicationYear: entry.publicationYear,
  }));

  return new Response(JSON.stringify(entries), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
