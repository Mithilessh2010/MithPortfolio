const qs=(s,r=document)=>r.querySelector(s);
const qsa=(s,r=document)=>[...r.querySelectorAll(s)];
const menu=qs('#site-menu');
const toggle=qs('#menu-toggle');
const close=qs('.menu-close');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer=matchMedia('(pointer:fine)').matches;

function setMenu(open){
  if(!menu||!toggle)return;
  menu.classList.toggle('is-open',open);
  menu.setAttribute('aria-hidden',String(!open));
  toggle.classList.toggle('is-active',open);
  toggle.setAttribute('aria-expanded',String(open));
  toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
  document.body.classList.toggle('menu-open',open);
}
toggle?.addEventListener('click',()=>setMenu(!menu.classList.contains('is-open')));
close?.addEventListener('click',()=>setMenu(false));
menu?.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false)});
addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.classList.contains('is-open')){setMenu(false);toggle?.focus();}});
const year=qs('#year'); if(year)year.textContent=new Date().getFullYear();

// Subtle physical-card tilt used only where there is a real visual object.
function attachTilt(el,{maxX=4,maxY=5,lift=8}={}){
  if(!el||reduceMotion||!finePointer)return;
  let rx=0,ry=0,tx=0,ty=0,raf=0;
  const render=()=>{
    rx+=(tx-rx)*.12; ry+=(ty-ry)*.12;
    el.style.transform=`perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${lift}px)`;
    if(Math.abs(tx-rx)>.02||Math.abs(ty-ry)>.02) raf=requestAnimationFrame(render); else raf=0;
  };
  const queue=()=>{if(!raf)raf=requestAnimationFrame(render)};
  el.addEventListener('pointermove',e=>{
    const r=el.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    tx=-y*maxX; ty=x*maxY; queue();
  });
  el.addEventListener('pointerleave',()=>{tx=0;ty=0;queue();});
}
qsa('.project-page-card').forEach(el=>attachTilt(el,{maxX:2.6,maxY:3.2,lift:5}));
qsa('.certificate-card').forEach(el=>attachTilt(el,{maxX:2,maxY:2.5,lift:4}));
attachTilt(qs('.eh-band'),{maxX:1.8,maxY:2.2,lift:5});
attachTilt(qs('.about-portrait'),{maxX:3,maxY:4,lift:8});
attachTilt(qs('.pedro-showcase-visual'),{maxX:1.8,maxY:2.4,lift:4});

// VEYRA-inspired image-relative hotspots for the robotics page.
const inspector=qs('#robot-inspector');
const inspectorPlane=qs('#robot-inspector-plane');
const inspectorTitle=qs('#inspector-title');
const inspectorCopy=qs('#inspector-copy');
const inspectorHotspots=qsa('.inspector-hotspot',inspector||document);
function activateInspector(btn){
  if(!btn)return;
  inspectorHotspots.forEach(el=>el.classList.toggle('is-active',el===btn));
  if(inspectorTitle)inspectorTitle.textContent=btn.dataset.title||'';
  if(inspectorCopy)inspectorCopy.textContent=btn.dataset.copy||'';
}
inspectorHotspots.forEach(btn=>{
  btn.addEventListener('pointerenter',()=>activateInspector(btn));
  btn.addEventListener('focus',()=>activateInspector(btn));
  btn.addEventListener('click',()=>activateInspector(btn));
});
if(inspectorPlane&&finePointer&&!reduceMotion){
  let tx=0,ty=0,rx=0,ry=0;
  inspectorPlane.addEventListener('pointermove',e=>{
    const r=inspectorPlane.getBoundingClientRect();
    tx=((e.clientX-r.left)/r.width-.5)*5.2;
    ty=((e.clientY-r.top)/r.height-.5)*-4.2;
  });
  inspectorPlane.addEventListener('pointerleave',()=>{tx=0;ty=0});
  const tick=()=>{
    rx+=(tx-rx)*.08;ry+=(ty-ry)*.08;
    inspectorPlane.style.transform=`rotateY(${rx}deg) rotateX(${ry}deg)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
