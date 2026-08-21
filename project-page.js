const projects = {
  'streaming-hackpad': { number: '01', title: 'Streaming Hackpad' },
  'custom-devboard': { number: '02', title: 'Custom Dev Board' },
  'split-keyboard': { number: '03', title: 'Wireless Split Keyboard' },
  pulse: { number: '04', title: 'Pulse' },
};

const key = new URLSearchParams(window.location.search).get('project');
const project = projects[key] || { number: '00', title: 'Project' };

document.querySelector('#project-number').textContent = project.number;
document.querySelector('#project-title').textContent = project.title;
document.title = `${project.title} — Mithilessh Bhasker`;
