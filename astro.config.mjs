import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://dead-air-website.netlify.app",
  output: "static",
  integrations: [sitemap()],
});
