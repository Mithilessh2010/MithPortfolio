const projects = {
  'streaming-hackpad': {
    number: '01',
    title: 'Streaming Hackpad',
    source: 'https://github.com/Mithilessh2010/Streaming-Hackpad',
    image: 'assets/projects/hackpad-main.png',
    description: 'A macro-focused hardware controller project designed for streaming and media workflows.',
    overview: 'Streaming Hackpad explores custom controls, hardware interaction, and a more intentional workflow tool for media-related tasks.',
    role: 'Builder',
    category: 'Hardware + media control',
    focus: 'Workflow + physical interaction',
    code: 'keys.map(mediaMacros);\nfirmware.flash();\niterate();'
  },
  'custom-devboard': {
    number: '02',
    title: 'Custom Dev Board',
    source: 'https://github.com/Mithilessh2010/Custom-Devboard',
    image: 'assets/projects/devboard-main.png',
    description: 'A development board build focused on prototyping, electronics understanding, and full-system thinking.',
    overview: 'This project pushed hardware planning, board-level thinking, and iteration across both design and implementation.',
    role: 'Builder',
    category: 'Electronics',
    focus: 'PCB + prototyping',
    code: 'board.route(power);\nvalidate(schematic);\nprototype.next();'
  },
  'split-keyboard': {
    number: '03',
    title: 'Wireless Split Keyboard',
    source: 'https://github.com/Mithilessh2010/Split-Keyboard',
    image: 'assets/projects/keyboard-main.png',
    description: 'A keyboard project exploring ergonomics, wireless interaction, and a more thoughtful input experience.',
    overview: 'Wireless Split Keyboard was about making something practical while also learning from layout, hardware, and usability choices.',
    role: 'Builder',
    category: 'Input devices',
    focus: 'Ergonomics + hardware',
    code: 'layout.tune();\nconnectWireless();\nshipPrototype();'
  },
  pulse: {
    number: '04',
    title: 'Pulse',
    source: 'https://github.com/Mithilessh2010/Pulse',
    image: 'assets/projects/pulse-home.png',
    description: 'A web/product concept focused on clarity, rhythm, and stronger digital experience design.',
    overview: 'Pulse focuses on cleaner visual communication and a frontend experience that feels more intentional and polished.',
    role: 'Designer + Builder',
    category: 'Web app',
    focus: 'Frontend + UI systems',
    code: 'animate.gently();\nrefine(layout);\ndeploy();'
  },
};

const key = new URLSearchParams(window.location.search).get('project');
const project = projects[key] || projects['streaming-hackpad'];
document.title = `${project.title} — Mithilessh Bhasker`;

document.querySelector('#project-number').textContent = project.number;
document.querySelector('#project-title').textContent = project.title;
document.querySelector('#project-description').textContent = project.description;
document.querySelector('#project-overview').textContent = project.overview;
document.querySelector('#project-role').textContent = project.role;
document.querySelector('#project-category').textContent = project.category;
document.querySelector('#project-focus').textContent = project.focus;
document.querySelector('#project-code').textContent = project.code;

document.querySelector('#project-main-image').src = project.image;
document.querySelector('#project-main-image').alt = `${project.title} preview`;

const sourceLink = document.querySelector('#project-source');
sourceLink.href = project.source;
sourceLink.hidden = false;


const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer:fine)').matches;
const visualPanel = document.querySelector('.project-panel:first-child');
if (visualPanel && finePointer && !reduceMotion) {
  let tx=0,ty=0,rx=0,ry=0;
  visualPanel.addEventListener('pointermove', e => {
    const r=visualPanel.getBoundingClientRect();
    tx=((e.clientX-r.left)/r.width-.5)*4.5;
    ty=((e.clientY-r.top)/r.height-.5)*-3.5;
  });
  visualPanel.addEventListener('pointerleave',()=>{tx=0;ty=0});
  const tick=()=>{
    rx+=(tx-rx)*.09; ry+=(ty-ry)*.09;
    visualPanel.style.transform=`rotateY(${rx}deg) rotateX(${ry}deg) translateZ(8px)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
