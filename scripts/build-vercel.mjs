import { copyFile, cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "public");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

await Promise.all([
  copyFile(resolve(root, "index.html"), resolve(output, "index.html")),
  copyFile(resolve(root, "styles.css"), resolve(output, "styles.css")),
  copyFile(resolve(root, "script.js"), resolve(output, "script.js")),
  copyFile(resolve(root, "project.html"), resolve(output, "project.html")),
  copyFile(resolve(root, "project.css"), resolve(output, "project.css")),
  copyFile(resolve(root, "project-page.js"), resolve(output, "project-page.js")),
  copyFile(resolve(root, "resume.html"), resolve(output, "resume.html")),
  copyFile(resolve(root, "resume.css"), resolve(output, "resume.css")),
  cp(resolve(root, "assets"), resolve(output, "assets"), { recursive: true }),
]);

console.log(`Built Vercel static site in ${output}`);
