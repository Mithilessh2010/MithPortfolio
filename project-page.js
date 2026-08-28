const projects = {
  'streaming-hackpad': { number: '01', title: 'Streaming Hackpad', source: 'https://github.com/Mithilessh2010/Streaming-Hackpad' },
  'custom-devboard': { number: '02', title: 'Custom Dev Board', source: 'https://github.com/Mithilessh2010/Custom-Devboard' },
  'split-keyboard': { number: '03', title: 'Wireless Split Keyboard', source: 'https://github.com/Mithilessh2010/Split-Keyboard' },
  pulse: { number: '04', title: 'Pulse', source: 'https://github.com/Mithilessh2010/Pulse' },
};

const key = new URLSearchParams(window.location.search).get('project');
const project = projects[key] || { number: '00', title: 'Project' };

document.querySelector('#project-number').textContent = project.number;
document.querySelector('#project-title').textContent = project.title;
document.title = `${project.title} — Mithilessh Bhasker`;

const projectSource = document.querySelector('#project-source');
if (project.source && projectSource) {
  projectSource.href = project.source;
  projectSource.hidden = false;
}

const projectCursor = document.querySelector('.project-cursor');
if (projectCursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.body.classList.add('has-custom-cursor');
  window.addEventListener('pointermove', (event) => {
    projectCursor.style.left = `${event.clientX}px`;
    projectCursor.style.top = `${event.clientY}px`;
    projectCursor.classList.toggle('is-clickable', Boolean(event.target.closest('a, button')));
    projectCursor.classList.toggle('is-text', !event.target.closest('a, button') && Boolean(event.target.closest('p, h1, h2, h3, span')));
    projectCursor.classList.add('is-visible');
  }, { passive: true });
  window.addEventListener('pointerdown', () => projectCursor.classList.add('is-down'));
  window.addEventListener('pointerup', () => projectCursor.classList.remove('is-down'));
  window.addEventListener('blur', () => projectCursor.classList.remove('is-visible'));
}
