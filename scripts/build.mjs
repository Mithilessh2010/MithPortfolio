import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const pdf = await readFile(resolve(root,"Mithilessh-Bhasker-Resume.pdf"));
const css = await readFile(resolve(root,"styles.css"),"utf8");
const js = await readFile(resolve(root,"script.js"),"utf8");
const topicCss = await readFile(resolve(root,"topic.css"),"utf8");
const topicJs = await readFile(resolve(root,"topic.js"),"utf8");
const projectCss = await readFile(resolve(root,"project.css"),"utf8");
const projectJs = await readFile(resolve(root,"project-page.js"),"utf8");
const resumeCss = await readFile(resolve(root,"resume.css"),"utf8");
const cursorCss = await readFile(resolve(root,"cursor.css"),"utf8");
const cursorJs = await readFile(resolve(root,"cursor.js"),"utf8");

const pageFiles = ["index.html","robotics.html","pedro.html","equal-horizons.html","projects.html","recognition.html","about.html","project.html","resume.html"];
const localImages = [
  "assets/favicon.svg","assets/profile.png","assets/pfp.jpg","assets/robot/roboracers-cutout.png",
  "assets/certifications/cs50x.png","assets/certifications/ibm-cybersecurity.png","assets/certifications/nasa-remote-sensing.png","assets/certifications/hack-club-stardance.png",
  "assets/projects/hackpad-main.png","assets/projects/hackpad-detail.png","assets/projects/devboard-main.png","assets/projects/devboard-detail.png","assets/projects/keyboard-main.png","assets/projects/keyboard-detail.png","assets/projects/pulse-home.png","assets/projects/pulse-mobile.png",
  "assets/logos/pedro-pathing.svg","assets/logos/stang-hacks.webp","assets/logos/pulse.svg","assets/logos/equal-horizons.svg","assets/logos/breathe.jpg","assets/logos/java.svg","assets/logos/typescript.svg","assets/logos/javascript.svg","assets/logos/react.svg","assets/logos/python.svg","assets/logos/nextjs.svg","assets/logos/tailwind.svg","assets/logos/github.svg","assets/logos/vite.svg","assets/logos/supabase.svg","assets/logos/robo-racers.png",
  "assets/awards/ftc-think-award.png","assets/awards/aops-algebra-2.png","assets/awards/aops-contest-math.png","assets/awards/kumon-reading.png"
];
const mime=(p)=>p.endsWith('.svg')?'image/svg+xml':p.endsWith('.webp')?'image/webp':p.endsWith('.jpg')||p.endsWith('.jpeg')?'image/jpeg':'image/png';
const dataUrls={};
for(const imagePath of localImages){
  const buf=await readFile(resolve(root,imagePath));
  dataUrls[imagePath]=`data:${mime(imagePath)};base64,${buf.toString('base64')}`;
}
const pages={};
for(const name of pageFiles){
  let html=await readFile(resolve(root,name),'utf8');
  if(name==='index.html') html=html.replace('<link rel="stylesheet" href="styles.css" />',`<style>${css}</style>`).replace('<script src="script.js" defer></script>',`<script type="module">${js}</script>`);
  else if(name==='project.html') html=html.replace('<link rel="stylesheet" href="project.css" />',`<style>${projectCss}</style>`).replace('<script src="project-page.js" defer></script>',`<script type="module">${projectJs}</script>`);
  else if(name==='resume.html') html=html.replace('<link rel="stylesheet" href="resume.css" />',`<style>${resumeCss}</style>`);
  else html=html.replace('<link rel="stylesheet" href="styles.css"/>',`<style>${css}</style>`).replace('<link rel="stylesheet" href="topic.css"/>',`<style>${topicCss}</style>`).replace('<script src="topic.js" defer></script>',`<script type="module">${topicJs}</script>`);
  html=html.replace('<link rel="stylesheet" href="cursor.css" />',`<style>${cursorCss}</style>`).replace('<script src="cursor.js" defer></script>',`<script type="module">${cursorJs}</script>`);
  for(const [path,url] of Object.entries(dataUrls)) html=html.replaceAll(path,url);
  pages[name]=html;
}
const pdfBase64=pdf.toString('base64');
const worker=`const pages=${JSON.stringify(pages)};\nconst pdfBase64=${JSON.stringify(pdfBase64)};\nfunction decodeBase64(base64){const binary=atob(base64);const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes;}\nconst routeMap={'/':'index.html','/index.html':'index.html','/robotics':'robotics.html','/robotics.html':'robotics.html','/pedro':'pedro.html','/pedro.html':'pedro.html','/equal-horizons':'equal-horizons.html','/equal-horizons.html':'equal-horizons.html','/projects':'projects.html','/projects.html':'projects.html','/recognition':'recognition.html','/recognition.html':'recognition.html','/about':'about.html','/about.html':'about.html','/project':'project.html','/project.html':'project.html','/resume':'resume.html','/resume.html':'resume.html'};\nexport default{async fetch(request){const url=new URL(request.url);if(url.pathname==='/Mithilessh-Bhasker-Resume.pdf')return new Response(decodeBase64(pdfBase64),{headers:{'content-type':'application/pdf','content-disposition':'inline; filename="Mithilessh-Bhasker-Resume.pdf"','cache-control':'public, max-age=300'}});const file=routeMap[url.pathname];if(!file)return new Response('Not found',{status:404});return new Response(pages[file],{headers:{'content-type':'text/html; charset=utf-8','cache-control':'public, max-age=300','x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin'}});}};`;
await rm(dist,{recursive:true,force:true});
await mkdir(resolve(dist,"server"),{recursive:true});
await mkdir(resolve(dist,".openai"),{recursive:true});
await writeFile(resolve(dist,"server/index.js"),worker);
try{await copyFile(resolve(root,".openai/hosting.json"),resolve(dist,".openai/hosting.json"));}catch(error){if(error.code!=="ENOENT")throw error;}
console.log(`Built ${dist}`);
