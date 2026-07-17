import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const site = process.env.PUBLIC_SITE_URL ?? "https://dead-air-website.netlify.app";

export default defineConfig({
  site,
  output: "static",
  integrations: [sitemap()],
});
