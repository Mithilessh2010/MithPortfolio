import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");

const [html, css, javascript, projectHtml, projectCss, projectJavascript, resumeHtml, resumeCss] = await Promise.all([
  readFile(resolve(root, "index.html"), "utf8"),
  readFile(resolve(root, "styles.css"), "utf8"),
  readFile(resolve(root, "script.js"), "utf8"),
  readFile(resolve(root, "project.html"), "utf8"),
  readFile(resolve(root, "project.css"), "utf8"),
  readFile(resolve(root, "project-page.js"), "utf8"),
  readFile(resolve(root, "resume.html"), "utf8"),
  readFile(resolve(root, "resume.css"), "utf8"),
]);

let page = html
  .replace('<link rel="stylesheet" href="styles.css" />', `<style>${css}</style>`)
  .replace('<script src="script.js" defer></script>', `<script type="module">${javascript}</script>`);

let projectPage = projectHtml
  .replace('<link rel="stylesheet" href="project.css" />', `<style>${projectCss}</style>`)
  .replace('<script src="project-page.js" defer></script>', `<script type="module">${projectJavascript}</script>`);

let resumePage = resumeHtml.replace('<link rel="stylesheet" href="resume.css" />', `<style>${resumeCss}</style>`);

const localImages = [
  "assets/favicon.svg",
  "assets/profile.png",
  "assets/certifications/cs50x.png",
  "assets/certifications/ibm-cybersecurity.png",
  "assets/certifications/nasa-remote-sensing.png",
  "assets/certifications/hack-club-stardance.png",
  "assets/projects/hackpad-main.png",
  "assets/projects/hackpad-detail.png",
  "assets/projects/devboard-main.png",
  "assets/projects/devboard-detail.png",
  "assets/projects/keyboard-main.png",
  "assets/projects/keyboard-detail.png",
  "assets/projects/pulse-home.png",
  "assets/projects/pulse-mobile.png",
  "assets/logos/pedro-pathing.svg",
  "assets/logos/stang-hacks.webp",
  "assets/logos/pulse.svg",
  "assets/logos/breathe.jpg",
  "assets/logos/java.svg",
  "assets/logos/typescript.svg",
  "assets/logos/javascript.svg",
  "assets/logos/react.svg",
  "assets/logos/python.svg",
  "assets/logos/nextjs.svg",
  "assets/logos/tailwind.svg",
  "assets/logos/github.svg",
  "assets/logos/vite.svg",
  "assets/logos/supabase.svg",
  "assets/logos/robo-racers.png",
  "assets/awards/ftc-think-award.png",
  "assets/awards/aops-algebra-2.png",
  "assets/awards/aops-contest-math.png",
  "assets/awards/kumon-reading.png",
];

const imageMime = (imagePath) => {
  if (imagePath.endsWith(".svg")) return "image/svg+xml";
  if (imagePath.endsWith(".webp")) return "image/webp";
  if (imagePath.endsWith(".jpg") || imagePath.endsWith(".jpeg")) return "image/jpeg";
  return "image/png";
};

for (const imagePath of localImages) {
  const image = await readFile(resolve(root, imagePath));
  const dataUrl = `data:${imageMime(imagePath)};base64,${image.toString("base64")}`;
  page = page.replaceAll(imagePath, dataUrl);
  projectPage = projectPage.replaceAll(imagePath, dataUrl);
  resumePage = resumePage.replaceAll(imagePath, dataUrl);
}

const worker = `const page = ${JSON.stringify(page)};
const projectPage = ${JSON.stringify(projectPage)};
const resumePage = ${JSON.stringify(resumePage)};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    let responsePage;
    if (url.pathname === "/" || url.pathname === "/index.html") {
      responsePage = page;
    } else if (url.pathname === "/project" || url.pathname === "/project.html") {
      responsePage = projectPage;
    } else if (url.pathname === "/resume" || url.pathname === "/resume.html") {
      responsePage = resumePage;
    } else {
      return new Response("Not found", { status: 404 });
    }

    return new Response(responsePage, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300",
        "x-content-type-options": "nosniff",
        "referrer-policy": "strict-origin-when-cross-origin"
      }
    });
  }
};
`;

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, "server"), { recursive: true });
await mkdir(resolve(dist, ".openai"), { recursive: true });
await writeFile(resolve(dist, "server/index.js"), worker);
try {
  await copyFile(
    resolve(root, ".openai/hosting.json"),
    resolve(dist, ".openai/hosting.json"),
  );
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

console.log(`Built ${dist}`);
