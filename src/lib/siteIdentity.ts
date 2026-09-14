export const SITE_NAME = "Dead Air";
export const SITE_ALTERNATE_NAME = "The Dead Air Archive";
export const SITE_DESCRIPTION = "Literary paranormal horror presented through stories and reader-facing archive records.";
export const SITE_LANGUAGE = "en-US";

export function getSiteIdentity(base: URL | string) {
  const homeUrl = new URL("/", base).toString();

  return {
    homeUrl,
    websiteId: new URL("#website", homeUrl).toString(),
    seriesId: new URL("#series", homeUrl).toString(),
  };
}
