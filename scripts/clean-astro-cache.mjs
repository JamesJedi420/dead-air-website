import { rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const cacheDirectory = path.join(process.cwd(), ".astro");
await rm(cacheDirectory, { recursive: true, force: true });
console.log("Astro content cache cleared before archive materialization.");
