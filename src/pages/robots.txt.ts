import type { APIContext } from "astro";

export function GET(context: APIContext) {
  const site = context.site ?? new URL("https://readdeadair.com");
  const sitemapUrl = new URL("sitemap-index.xml", site);

  return new Response(`User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
