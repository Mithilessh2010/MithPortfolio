const qs = (s, root=document) => root.querySelector(s);
const qsa = (s, root=document) => [...root.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer:fine)').matches;

// Entrance waits for fonts, then detaches the staging classes.
(() => {
  if (reduceMotion || !document.documentElement.classList.contains('anim')) return;
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    document.documentElement.classList.add('go');
    setTimeout(() => document.documentElement.classList.remove('anim','go'), 2400);
  };
  const timer = setTimeout(start, 850);
  if (document.fonts?.ready) document.fonts.ready.then(()=>{clearTimeout(timer); start();}, start);
  else addEventListener('DOMContentLoaded', start, {once:true});
})();


// OG mithib.com decrypt effect — now applied to BOTH name lines.
// It runs on first load, then replays whenever the hero name is hovered/focused.
function initNameScramble(){
  const heroName = qs('#hero-name');
  const targets = qsa('[data-scramble]', heroName || document);
  if(!heroName || !targets.length || reduceMotion) return;

  const glyphs = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  const states = targets.map((el) => {
    const original = el.dataset.scramble || '';
    const textNode = [...el.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
    return { el, original, textNode, frame: 0 };
  }).filter((state) => state.textNode && state.original);

  const isLockedCharacter = (character) => /[\s.,'’\-]/.test(character);

  const scrambleOne = (state, duration, delay = 0) => {
    cancelAnimationFrame(state.frame);
    const scheduled = performance.now() + delay;

    const draw = (now) => {
      if(now < scheduled){
        state.frame = requestAnimationFrame(draw);
        return;
      }

      const progress = Math.min((now - scheduled) / duration, 1);
      // Keep the beginning chaotic for a moment, then decrypt left → right.
      const eased = progress < .12 ? 0 : 1 - Math.pow(1 - ((progress - .12) / .88), 2.15);
      const solved = Math.floor(Math.max(0, eased) * state.original.length);

      state.textNode.nodeValue = [...state.original].map((character, index) => {
        if(isLockedCharacter(character) || index < solved) return character;
        return glyphs[Math.floor(Math.random() * glyphs.length)];
      }).join('');

      if(progress < 1) state.frame = requestAnimationFrame(draw);
      else state.textNode.nodeValue = state.original;
    };

    state.frame = requestAnimationFrame(draw);
  };

  const scrambleName = ({ initial = false } = {}) => {
    // First load is deliberately more cinematic; hover is the quicker OG-style replay.
    const duration = initial ? 1320 : 720;
    states.forEach((state, index) => scrambleOne(state, duration, initial ? index * 115 : index * 45));
  };

  heroName.addEventListener('pointerenter', () => scrambleName());
  heroName.addEventListener('focusin', () => scrambleName());

  // Start while the masked hero lines are rising, not after they have already settled.
  // Waiting for fonts avoids a flash/layout shift while still making it visible immediately on load.
  let initialRan = false;
  const runInitial = () => {
    if(initialRan) return;
    initialRan = true;
    requestAnimationFrame(() => requestAnimationFrame(() => scrambleName({ initial: true })));
  };

  if(document.fonts?.ready){
    const guard = setTimeout(runInitial, 260);
    document.fonts.ready.then(() => { clearTimeout(guard); runInitial(); }, runInitial);
  }else if(document.readyState === 'loading'){
    addEventListener('DOMContentLoaded', runInitial, { once:true });
  }else{
    runInitial();
  }
}
initNameScramble();

// Full-screen menu.
const menu = qs('#site-menu');
const menuToggle = qs('#menu-toggle');
const menuClose = qs('.menu-close');
function setMenu(open){
  if(!menu || !menuToggle) return;
  menu.classList.toggle('is-open', open);
  menu.setAttribute('aria-hidden', String(!open));
  menuToggle.classList.toggle('is-active', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  document.body.classList.toggle('menu-open', open);
}
menuToggle?.addEventListener('click',()=>setMenu(!menu.classList.contains('is-open')));
menuClose?.addEventListener('click',()=>setMenu(false));
menu?.addEventListener('click',(e)=>{ if(e.target.closest('a')) setMenu(false); });
addEventListener('keydown',(e)=>{ if(e.key==='Escape' && menu?.classList.contains('is-open')) { setMenu(false); menuToggle?.focus(); } });

const year = qs('#year'); if(year) year.textContent = new Date().getFullYear();
const scrollLine = qs('#scroll-line');

function showVisitorIncrement(){
  if(reduceMotion)return;
  const wrap=qs('#visitor-count-wrap');
  if(!wrap)return;
  const increment=document.createElement('i');
  increment.className='visitor-increment';
  increment.setAttribute('aria-hidden','true');
  increment.textContent='+1';
  wrap.append(increment);
  requestAnimationFrame(()=>wrap.classList.add('is-incrementing'));
  increment.addEventListener('animationend',()=>{
    increment.remove();
    wrap.classList.remove('is-incrementing');
  },{once:true});
}

// Count this browser once, even when the homepage is refreshed or revisited.
async function updateVisitorCount(){
  const wrap=qs('#visitor-count-wrap');
  const value=qs('#visitor-count');
  if(!wrap||!value)return;

  try{
    const response=await fetch('/api/views',{method:'POST',credentials:'same-origin',cache:'no-store'});
    if(!response.ok)throw new Error(`View counter returned ${response.status}`);
    const data=await response.json();
    if(!Number.isSafeInteger(data.count)||data.count<0)throw new Error('Invalid view count');

    value.textContent=new Intl.NumberFormat().format(data.count);
    wrap.hidden=false;
    wrap.setAttribute('aria-label',`${data.count} unique ${data.count===1?'visitor':'visitors'}`);
    if(data.newVisitor===true)showVisitorIncrement();
  }catch(error){
    // Keep the optional counter hidden if storage is not configured or unavailable.
    console.warn('Unique visitor count unavailable',error);
  }
}
updateVisitorCount();

function updateScroll(){
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  if(scrollLine) scrollLine.style.width = `${Math.min(100, scrollY/max*100)}%`;
}
updateScroll(); addEventListener('scroll',updateScroll,{passive:true}); addEventListener('resize',updateScroll,{passive:true});

// Reveal sections.
if('IntersectionObserver' in window){
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if(entry.isIntersecting){ entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), {threshold:.12, rootMargin:'0px 0px -7% 0px'});
  qsa('.reveal-block').forEach(el=>observer.observe(el));
}else qsa('.reveal-block').forEach(el=>el.classList.add('is-visible'));

// Magnetic buttons, intentionally subtle.
if(finePointer && !reduceMotion){
  qsa('.magnetic').forEach(el=>{
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect();
      const x=e.clientX-r.left-r.width/2; const y=e.clientY-r.top-r.height/2;
      el.style.transform=`translate(${x*.06}px,${y*.06}px)`;
    });
    el.addEventListener('pointerleave',()=>el.style.transform='');
  });
}

// Hero portrait physical depth.
const portrait = qs('#portrait-object');
const mainSheet = qs('.main-sheet', portrait || document);
if(portrait && mainSheet && finePointer && !reduceMotion){
  let tx=0,ty=0,x=0,y=0;
  portrait.addEventListener('pointermove',e=>{
    const r=portrait.getBoundingClientRect();
    tx=((e.clientX-r.left)/r.width-.5)*12;
    ty=((e.clientY-r.top)/r.height-.5)*-10;
  });
  portrait.addEventListener('pointerleave',()=>{tx=0;ty=0;});
  const tick=()=>{x+=(tx-x)*.08;y+=(ty-y)*.08;mainSheet.style.transform=`rotateY(${x}deg) rotateX(${y}deg) translateZ(34px)`;requestAnimationFrame(tick)};
  requestAnimationFrame(tick);
}

// Hero background: autonomous-path flow field projected from 3D.
// V19 performance pass: cache the expensive grid/curve layer and animate only the
// five moving particles every frame. This keeps the opening motion smooth even
// while the headline/profile entrance animation is running.
const canvas = qs('#hero-canvas');
const ctx = canvas?.getContext('2d', { alpha: true });
const heroBg = document.createElement('canvas');
const heroBgCtx = heroBg.getContext('2d', { alpha: true });
const glowSprite = document.createElement('canvas');
const glowCtx = glowSprite.getContext('2d');
let cw=1,ch=1,dpr=1,mouseX=0,mouseY=0,targetX=0,targetY=0;
let heroBgDirty=true, heroBgStamp=0, heroBgAX=999, heroBgAY=999;

function makeGlowSprite(){
  if(!glowCtx) return;
  const size=56;
  glowSprite.width=size; glowSprite.height=size;
  const g=glowCtx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
  g.addColorStop(0,'rgba(151,138,183,.58)');
  g.addColorStop(.22,'rgba(151,138,183,.28)');
  g.addColorStop(1,'rgba(151,138,183,0)');
  glowCtx.fillStyle=g; glowCtx.fillRect(0,0,size,size);
}
makeGlowSprite();

function resizeCanvas(){
  if(!canvas||!ctx) return;
  const r=canvas.getBoundingClientRect();
  cw=Math.max(1,r.width); ch=Math.max(1,r.height);
  // The hero is intentionally soft/faint, so 1.5x DPR is visually identical here
  // while avoiding a large 2x canvas cost on Retina displays.
  dpr=Math.min(devicePixelRatio||1,1.5);
  canvas.width=Math.round(cw*dpr); canvas.height=Math.round(ch*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  heroBg.width=Math.round(cw*dpr); heroBg.height=Math.round(ch*dpr);
  heroBgCtx?.setTransform(dpr,0,0,dpr,0,0);
  heroBgDirty=true;
}
resizeCanvas(); addEventListener('resize',resizeCanvas,{passive:true});
if(finePointer && canvas && !reduceMotion){
  addEventListener('pointermove',e=>{targetX=e.clientX/innerWidth-.5;targetY=e.clientY/innerHeight-.5},{passive:true});
}
function project3(x,y,z){
  const dist=7.2; const zz=z+dist; const f=Math.min(cw,ch)*.85/zz;
  return {x:cw*.58+x*f,y:ch*.52+y*f,f,z};
}
function pathPoint(t, lane=0){
  const a=t*Math.PI*2;
  return {
    x:(t-.5)*10 + Math.sin(a*1.35+lane*.7)*.5,
    y:Math.sin(a*1.15+lane*.9)*1.4 + lane*.3,
    z:Math.cos(a*.8+lane*.6)*1.8 + lane*.18
  };
}
function rotate(p,ax,ay){
  let {x,y,z}=p,c=Math.cos(ax),s=Math.sin(ax);
  [y,z]=[y*c-z*s,y*s+z*c];
  c=Math.cos(ay);s=Math.sin(ay);
  [x,z]=[x*c+z*s,-x*s+z*c];
  return {x,y,z};
}

function renderHeroBackground(ax,ay,time){
  if(!heroBgCtx) return;
  // The curve geometry does not need 60 fps. Rebuild at most ~24 fps while the
  // pointer is moving; otherwise keep the cached bitmap.
  const moved=Math.abs(ax-heroBgAX)>.0025 || Math.abs(ay-heroBgAY)>.0025;
  if(!heroBgDirty && !moved && time-heroBgStamp<400) return;
  if(!heroBgDirty && time-heroBgStamp<42) return;
  heroBgStamp=time; heroBgAX=ax; heroBgAY=ay; heroBgDirty=false;
  heroBgCtx.clearRect(0,0,cw,ch);

  // Quiet perspective floor.
  heroBgCtx.save();
  for(let zi=-3;zi<=5;zi++){
    const z=zi*.9;
    let a=rotate({x:-7.5,y:2.15,z},ax,ay), b=rotate({x:7.5,y:2.15,z},ax,ay);
    a=project3(a.x,a.y,a.z); b=project3(b.x,b.y,b.z);
    const alpha=.018 + Math.max(0,1-(z+3)/9)*.024;
    heroBgCtx.strokeStyle=`rgba(214,210,221,${alpha})`; heroBgCtx.lineWidth=1;
    heroBgCtx.beginPath();heroBgCtx.moveTo(a.x,a.y);heroBgCtx.lineTo(b.x,b.y);heroBgCtx.stroke();
  }
  for(let xi=-7;xi<=7;xi+=1.4){
    let a=rotate({x:xi,y:2.15,z:-3.6},ax,ay), b=rotate({x:xi,y:2.15,z:5.4},ax,ay);
    a=project3(a.x,a.y,a.z); b=project3(b.x,b.y,b.z);
    heroBgCtx.strokeStyle='rgba(214,210,221,.018)';
    heroBgCtx.beginPath();heroBgCtx.moveTo(a.x,a.y);heroBgCtx.lineTo(b.x,b.y);heroBgCtx.stroke();
  }
  heroBgCtx.restore();

  // Static spline geometry. The particles provide the motion, so there is no
  // reason to recompute 650+ moving path vertices on every animation frame.
  const lanes=5, count=82;
  for(let lane=0; lane<lanes; lane++){
    heroBgCtx.beginPath();
    for(let i=0;i<=count;i++){
      let p=pathPoint(i/count,lane-2);
      p=rotate(p,ax,ay);
      const q=project3(p.x,p.y,p.z);
      i?heroBgCtx.lineTo(q.x,q.y):heroBgCtx.moveTo(q.x,q.y);
    }
    heroBgCtx.strokeStyle=`rgba(${120+lane*7},${112+lane*6},${148+lane*7},${.055+lane*.012})`;
    heroBgCtx.lineWidth=1; heroBgCtx.stroke();
  }

  // Fixed depth specks — no per-frame twinkle needed behind large type.
  for(let i=0;i<24;i++){
    const seed=i*97.13;
    const x=(Math.sin(seed)*.5+.5)*cw, y=(Math.cos(seed*1.7)*.5+.5)*ch;
    heroBgCtx.fillStyle='rgba(255,255,255,.055)'; heroBgCtx.fillRect(x,y,1,1);
  }
}

function drawHero(time=0){
  if(!ctx) return;
  mouseX+=(targetX-mouseX)*.05; mouseY+=(targetY-mouseY)*.05;
  const ax=-.16+mouseY*.16, ay=.05+mouseX*.22;
  renderHeroBackground(ax,ay,time);

  ctx.clearRect(0,0,cw,ch);
  ctx.drawImage(heroBg,0,0,cw,ch);

  // Only five lightweight particles animate at full refresh rate.
  for(let lane=0; lane<5; lane++){
    const prog=(time*.00007+lane*.18)%1;
    let p=pathPoint(prog,lane-2);
    p=rotate(p,ax,ay);
    const q=project3(p.x,p.y,p.z);
    ctx.globalAlpha=.92;
    ctx.drawImage(glowSprite,q.x-28,q.y-28,56,56);
    ctx.fillStyle='rgba(190,181,210,.82)';
    ctx.beginPath();ctx.arc(q.x,q.y,2.35,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
  if(!reduceMotion) requestAnimationFrame(drawHero);
}
if(reduceMotion) drawHero(0); else requestAnimationFrame(drawHero);

// Robotics background grid + physical robot response.
const robotCanvas=qs('#robot-grid-canvas'); const rctx=robotCanvas?.getContext('2d'); const stage=qs('#robot-stage'); const robotWrap=qs('#robot-wrap');
function drawRobotGrid(){
  if(!robotCanvas||!rctx||!stage) return;
  const r=stage.getBoundingClientRect(), d=Math.min(devicePixelRatio||1,2); robotCanvas.width=r.width*d;robotCanvas.height=r.height*d;rctx.setTransform(d,0,0,d,0,0);rctx.clearRect(0,0,r.width,r.height);
  const cx=r.width*.5,cy=r.height*.62;
  rctx.strokeStyle='rgba(255,255,255,.055)';rctx.lineWidth=1;
  for(let i=-8;i<=8;i++){const x=cx+i*42;rctx.beginPath();rctx.moveTo(cx+(x-cx)*.22,cy-210);rctx.lineTo(x,cy+120);rctx.stroke();}
  for(let j=0;j<9;j++){const t=j/8;const y=cy-210+t*330;const span=50+t*500;rctx.beginPath();rctx.moveTo(cx-span/2,y);rctx.lineTo(cx+span/2,y);rctx.stroke();}
}
drawRobotGrid();addEventListener('resize',drawRobotGrid,{passive:true});
if(stage&&robotWrap&&finePointer&&!reduceMotion){
  stage.addEventListener('pointermove',e=>{
    const r=stage.getBoundingClientRect();
    const x=((e.clientX-r.left)/r.width-.5)*11;
    const y=((e.clientY-r.top)/r.height-.5)*-7;
    robotWrap.style.transform=`rotateY(${x}deg) rotateX(${y}deg) translateZ(34px)`;
  },{passive:true});
  stage.addEventListener('pointerleave',()=>{robotWrap.style.transform='rotateY(0deg) rotateX(0deg) translateZ(34px)'});
}

// Autonomous simulation.
const routeLine=qs('#route-line'),simRobot=qs('#sim-robot'),fieldBoard=qs('#field-board'),fieldCamera=qs('#field-camera'),replay=qs('#sim-replay'),speedInput=qs('#sim-speed');
const simState=qs('#sim-state'),simPose=qs('#sim-pose'),simHeading=qs('#sim-heading'),simProgress=qs('#sim-progress');let simStart=performance.now(),simFrame;
function runSim(now){
  if(!routeLine||!simRobot||!fieldBoard) return;
  const speed=Number(speedInput?.value||1),duration=6500/speed,raw=Math.min((now-simStart)/duration,1),eased=raw<.5?2*raw*raw:1-Math.pow(-2*raw+2,2)/2,total=routeLine.getTotalLength(),p=routeLine.getPointAtLength(eased*total),n=routeLine.getPointAtLength(Math.min(total,eased*total+3)),angle=Math.atan2(n.y-p.y,n.x-p.x)*180/Math.PI,w=fieldBoard.clientWidth,h=fieldBoard.clientHeight,x=p.x/1000*w,y=p.y/620*h;
  simRobot.style.transform=`translate(${x-47}px,${y-47}px) translateZ(30px) rotate(${angle*.35}deg) scale(${.72+eased*.07})`;
  if(simPose) simPose.textContent=`${(p.x/10).toFixed(1)}, ${(p.y/10).toFixed(1)}`; if(simHeading) simHeading.textContent=`${Math.round(angle)}°`; if(simProgress) simProgress.textContent=`${Math.round(raw*100)}%`; if(simState) simState.textContent=raw<1?'following route':'target reached'; if(raw<1) simFrame=requestAnimationFrame(runSim);
}
function restartSim(){cancelAnimationFrame(simFrame);simStart=performance.now();if(simProgress)simProgress.textContent='0%';if(!reduceMotion)simFrame=requestAnimationFrame(runSim)}
replay?.addEventListener('click',restartSim);speedInput?.addEventListener('input',restartSim);if(!reduceMotion)simFrame=requestAnimationFrame(runSim);
if(fieldCamera&&fieldBoard&&finePointer&&!reduceMotion){fieldCamera.addEventListener('pointermove',e=>{const r=fieldCamera.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;fieldBoard.style.transform=`rotateX(${54-y*5}deg) rotateZ(${-4+x*4}deg) translate3d(${x*8}px,${y*5}px,0)`});fieldCamera.addEventListener('pointerleave',()=>fieldBoard.style.transform='')}

// Pedro code cards respond as a shallow 3D sculpture.
const pedro=qs('#pedro-visual');
if(pedro&&finePointer&&!reduceMotion){pedro.addEventListener('pointermove',e=>{const r=pedro.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;qsa('.code-card',pedro).forEach((card,i)=>{const depth=(i+1)*12;const base=i===0?'rotate(-4deg)':i===1?'rotate(3deg)':'rotate(2deg)';card.style.transform=`${base} translate3d(${x*depth}px,${y*depth}px,${18+i*18}px) rotateX(${-y*3}deg) rotateY(${x*4}deg)`})});pedro.addEventListener('pointerleave',()=>qsa('.code-card',pedro).forEach((card,i)=>{card.style.transform=i===0?'rotate(-4deg)':i===1?'rotate(3deg)':'rotate(2deg)'}))}

// Equal Horizons layered physical disc.
const ehObject=qs('#eh-object');
if(ehObject&&finePointer&&!reduceMotion){let tx=0,ty=0;ehObject.addEventListener('pointermove',e=>{const r=ehObject.getBoundingClientRect();tx=((e.clientX-r.left)/r.width-.5)*10;ty=((e.clientY-r.top)/r.height-.5)*-8;qsa('.eh-disc',ehObject).forEach((disc,i)=>{disc.style.rotate=`${ty*.18}deg ${tx*.18}deg ${i===2?tx*.1:0}deg`})});ehObject.addEventListener('pointerleave',()=>qsa('.eh-disc',ehObject).forEach(d=>d.style.rotate=''))}

// Project image preview follows pointer only on desktop.
const preview=qs('#project-preview'); const previewImg=preview?.querySelector('img');
if(preview&&previewImg&&finePointer&&!reduceMotion){qsa('.project-row').forEach(row=>{row.addEventListener('pointerenter',()=>{previewImg.src=row.dataset.preview;preview.classList.add('visible')});row.addEventListener('pointermove',e=>{preview.style.left=`${e.clientX}px`;preview.style.top=`${e.clientY}px`});row.addEventListener('pointerleave',()=>preview.classList.remove('visible'))})}
