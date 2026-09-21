import { copyFile, cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "public");
const files = [
  "index.html","styles.css","script.js","topic.css","topic.js",
  "robotics.html","pedro.html","equal-horizons.html","projects.html","recognition.html","about.html",
  "project.html","project.css","project-page.js","resume.html","resume.css","cursor.css","cursor.js","Mithilessh-Bhasker-Resume.pdf"
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await Promise.all(files.map((name)=>copyFile(resolve(root,name),resolve(output,name))));
await cp(resolve(root,"assets"), resolve(output,"assets"), { recursive: true });
console.log(`Built Vercel static site in ${output}`);
