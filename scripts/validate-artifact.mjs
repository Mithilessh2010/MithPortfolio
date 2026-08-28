import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const workerPath = resolve(root, "dist/server/index.js");
const manifestPath = resolve(root, "dist/.openai/hosting.json");

const source = await readFile(workerPath, "utf8");
let manifestSource;
try {
  manifestSource = await readFile(manifestPath, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

if (manifestSource) {
  const manifest = JSON.parse(manifestSource);
  assert.equal(typeof manifest.project_id, "string");
}

const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const worker = await import(moduleUrl);
assert.equal(typeof worker.default?.fetch, "function");

const response = await worker.default.fetch(new Request("https://portfolio.test/"));
const html = await response.text();
const projectResponse = await worker.default.fetch(new Request("https://portfolio.test/project.html?project=pulse"));
const projectHtml = await projectResponse.text();
const resumeResponse = await worker.default.fetch(new Request("https://portfolio.test/resume.html"));
const resumeHtml = await resumeResponse.text();

assert.equal(response.status, 200);
assert.match(response.headers.get("content-type"), /text\/html/);
assert.match(html, /Mithilessh Bhasker/);
assert.match(html, /id="projects"/);
assert.match(html, /id="team"/);
assert.match(html, /id="certifications"/);
assert.match(html, /mithilesshb@gmail\.com/);
assert.match(html, /data:image\/png;base64/);
assert.match(html, /Cottonwood Creek/);
assert.match(html, /Class of 2029/);
assert.match(html, /Kumon Dublin Central/);
assert.match(html, /FTC Think Award/);
assert.match(html, /Algebra 2 Problem Solvers Showdown/);
assert.match(html, /High School Contest Math Challenge/);
assert.match(html, /Reading Program Completion/);
assert.match(html, /github\.com\/Mithilessh2010\/Custom-Devboard/);
assert.match(html, /github\.com\/Mithilessh2010\/Streaming-Hackpad/);
assert.match(html, /github\.com\/Mithilessh2010\/Split-Keyboard/);
assert.match(html, /github\.com\/Mithilessh2010\/Pulse/);
assert.doesNotMatch(html, /class="clock"/);
assert.doesNotMatch(html, /<a class="certificate-card/);
assert.equal(projectResponse.status, 200);
assert.match(projectHtml, /soon to come\./);
assert.match(projectHtml, /project-page\.js|const projects/);
assert.equal(resumeResponse.status, 200);
assert.match(resumeHtml, /Save as PDF/);
assert.match(resumeHtml, /Robo Racers 16481/);
assert.match(resumeHtml, /Dublin Central Instructor/);

console.log("Portfolio artifact is valid and serves the complete site and project page");
