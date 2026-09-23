import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
const root=resolve(import.meta.dirname,"..");
const source=await readFile(resolve(root,"dist/server/index.js"),"utf8");
const worker=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
for(const [path,pattern] of [['/',/Mithilessh/],['/pedro.html',/12 merged PRs/],['/robotics.html',/Software Lead/],['/equal-horizons.html',/Equal Horizons/],['/projects.html',/Streaming Hackpad/],['/recognition.html',/CS50x/],['/about.html',/Mithilessh Bhasker/],['/resume.html',/Kumon Reading Program Completer/]]){
  const r=await worker.default.fetch(new Request(`https://portfolio.test${path}`));
  assert.equal(r.status,200); const html=await r.text(); assert.match(html,pattern);
}
const pdf=await worker.default.fetch(new Request('https://portfolio.test/Mithilessh-Bhasker-Resume.pdf'));assert.equal(pdf.status,200);assert.match(pdf.headers.get('content-type'),/application\/pdf/);
console.log('Portfolio artifact is valid');
