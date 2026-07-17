import { collectionLabels, formatLabel } from "../lib/archive";
import { getNormalizedArchive } from "../lib/loadArchive";

export async function GET() {
  const entries = (await getNormalizedArchive()).map((entry) => ({
    ...entry,
    collection: collectionLabels[entry.collection],
    status: formatLabel(entry.status),
    canonicalStatus: formatLabel(entry.canonicalStatus),
  }));

  return new Response(JSON.stringify(entries), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
