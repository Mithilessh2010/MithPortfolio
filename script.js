const root = document.documentElement;
const body = document.body;
const timeElement = document.querySelector('#local-time');
const yearElement = document.querySelector('#year');
const shareButton = document.querySelector('#share-button');
const copyButton = document.querySelector('#copy-button');
const introCopy = document.querySelector('#intro-copy');
const toast = document.querySelector('#toast');
const robotRail = document.querySelector('.robot-rail');
const robot = document.querySelector('#scroll-bot');
const robotSection = document.querySelector('#bot-section');
const robotNumber = document.querySelector('#bot-number');
const pointerState = document.querySelector('#pointer-state');
const cursorRing = document.querySelector('.cursor-ring');
const cursorDot = document.querySelector('.cursor-dot');
const cursorLabel = document.querySelector('#cursor-label');
const pointerLight = document.querySelector('.pointer-light');
const sections = [...document.querySelectorAll('main section[id]')];
const pushSections = [...document.querySelectorAll('.push-section')];
const projectImages = [...document.querySelectorAll('.project-image img')];
const projectItems = [...document.querySelectorAll('.project-item')];
const heroSection = document.querySelector('#about');
const projectSection = document.querySelector('#projects');
const projectStage = document.querySelector('.project-scroll-stage');
const projectTrack = document.querySelector('.project-list');
const motionSections = [...document.querySelectorAll('.push-section:not(#projects)')];
const certificateImages = [...document.querySelectorAll('.certificate-image img')];
const navLinks = [...document.querySelectorAll('.nav-links a')];
const tiltTargets = [...document.querySelectorAll('[data-tilt]')];
const magneticTargets = [...document.querySelectorAll('.mini-mark, .nav-links a, .hero-actions a, .hero-actions button, .scroll-invite, .project-link')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

let scrollTicking = false;
let scrollIdleTimer;

const clamp = (value, minimum = 0, maximum = 1) => Math.min(Math.max(value, minimum), maximum);

function updateTime() {
  if (!timeElement) return;

  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());

  timeElement.textContent = `${time} PT`;
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('show'), 1700);
}

function getActiveSection() {
  const marker = window.innerHeight * 0.46;
  return sections.reduce((current, section) => {
    return section.getBoundingClientRect().top <= marker ? section : current;
  }, sections[0]);
}

function updateScrollScene() {
  const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const progress = Math.min(Math.max(window.scrollY / scrollable, 0), 1);

  if (robotRail && robot) {
    const travel = Math.max(robotRail.clientHeight - robot.offsetHeight, 0);
    root.style.setProperty('--robot-y', `${Math.round(progress * travel)}px`);
    root.style.setProperty('--rail-fill', `${(progress * 100).toFixed(2)}%`);
  }

  if (heroSection && !reduceMotion) {
    const heroRect = heroSection.getBoundingClientRect();
    const heroProgress = clamp(-heroRect.top / Math.max(heroSection.offsetHeight * .78, 1));
    root.style.setProperty('--hero-scroll', heroProgress.toFixed(4));
  }

  if (!reduceMotion) {
    motionSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const travel = Math.max(rect.height + window.innerHeight, 1);
      const sectionProgress = clamp((window.innerHeight - rect.top) / travel);
      const sectionShift = (sectionProgress - .5) * 2;

      section.style.setProperty('--section-progress', sectionProgress.toFixed(4));
      section.style.setProperty('--section-shift', sectionShift.toFixed(4));
      section.style.setProperty('--section-x', `${(sectionShift * 18).toFixed(1)}px`);
      section.style.setProperty('--section-x-reverse', `${(sectionShift * -18).toFixed(1)}px`);
      section.style.setProperty('--section-y', `${(sectionShift * 22).toFixed(1)}px`);
      section.style.setProperty('--section-y-reverse', `${(sectionShift * -22).toFixed(1)}px`);
      section.style.setProperty('--section-tilt', `${(sectionShift * .35).toFixed(2)}deg`);
      section.style.setProperty('--section-tilt-reverse', `${(sectionShift * -.35).toFixed(2)}deg`);
      section.style.setProperty('--section-scan', `${(sectionProgress * 100).toFixed(2)}%`);
    });
  }

  if (projectSection && projectStage && projectTrack && window.innerWidth > 900 && !reduceMotion) {
    const projectRect = projectSection.getBoundingClientRect();
    const scrollLength = Math.max(projectSection.offsetHeight - window.innerHeight, 1);
    const projectProgress = clamp((72 - projectRect.top) / scrollLength);
    const maximumShift = Math.max(projectTrack.scrollWidth - projectStage.clientWidth, 0);

    root.style.setProperty('--project-progress', projectProgress.toFixed(4));
    root.style.setProperty('--project-x', `${(-projectProgress * maximumShift).toFixed(1)}px`);

    projectItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - window.innerWidth / 2);
      const focus = 1 - clamp(distance / (window.innerWidth * .62));
      item.style.setProperty('--card-focus', focus.toFixed(3));
    });
  } else {
    root.style.setProperty('--project-progress', '0');
    root.style.setProperty('--project-x', '0px');
    projectItems.forEach((item) => item.style.setProperty('--card-focus', '1'));
  }

  const active = getActiveSection();
  const activeId = active?.id || 'about';
  const sectionName = active?.dataset.sectionName || activeId;
  const sectionNumber = active?.dataset.sectionNumber || '01';

  if (robotSection) robotSection.textContent = sectionName;
  if (robotNumber) robotNumber.textContent = sectionNumber;
  if (robot) robot.dataset.mode = activeId;

  navLinks.forEach((link) => link.classList.toggle('active', link.hash === `#${activeId}`));

  if (!reduceMotion) {
    projectImages.forEach((image) => {
      const rect = image.closest('.project-image').getBoundingClientRect();
      const centerDelta = rect.top + rect.height / 2 - window.innerHeight / 2;
      const depth = image.classList.contains('project-media-detail') ? .72 : 1;
      const direction = image.classList.contains('project-media-detail') ? -1 : 1;
      const shift = Math.max(-22, Math.min(22, centerDelta * -0.04 * depth * direction));
      image.style.setProperty('--image-shift', `${shift.toFixed(1)}px`);
    });

    certificateImages.forEach((image) => {
      const rect = image.closest('.certificate-card').getBoundingClientRect();
      const centerDelta = rect.top + rect.height / 2 - window.innerHeight / 2;
      const shift = Math.max(-14, Math.min(14, centerDelta * -0.025));
      image.style.setProperty('--certificate-shift', `${shift.toFixed(1)}px`);
    });
  }

  scrollTicking = false;
}

function handleScroll() {
  body.classList.add('is-scrolling');
  window.clearTimeout(scrollIdleTimer);
  scrollIdleTimer = window.setTimeout(() => body.classList.remove('is-scrolling'), 140);

  if (!scrollTicking) {
    window.requestAnimationFrame(updateScrollScene);
    scrollTicking = true;
  }
}

function initCustomCursor() {
  if (!finePointer.matches || reduceMotion || !cursorRing || !cursorDot) return;

  body.classList.add('cursor-ready');

  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let ringX = pointerX;
  let ringY = pointerY;
  let glowX = pointerX;
  let glowY = pointerY;

  const setCursorContext = (target) => {
    const action = target.closest('[data-cursor], a, button');
    const overLight = Boolean(target.closest('.cursor-light-zone, [data-cursor-light]'));
    const reading = !action && Boolean(target.closest('p, h1, h2, h3, li, small'));

    cursorRing.classList.toggle('is-invert', overLight);
    cursorDot.classList.toggle('is-invert', overLight);
    if (cursorLabel) cursorLabel.textContent = '';
    if (pointerState) pointerState.textContent = action ? 'link' : reading ? 'read' : 'track';
  };

  const renderCursor = () => {
    ringX += (pointerX - ringX) * 0.18;
    ringY += (pointerY - ringY) * 0.18;
    glowX += (pointerX - glowX) * 0.08;
    glowY += (pointerY - glowY) * 0.08;

    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    cursorDot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
    if (pointerLight) pointerLight.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
    window.requestAnimationFrame(renderCursor);
  };

  document.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    body.classList.add('cursor-visible');
    setCursorContext(event.target);
  });

  document.addEventListener('pointerdown', () => {
    cursorRing.classList.add('is-down');
    cursorDot.classList.add('is-down');
    if (pointerState) pointerState.textContent = 'input';
  });

  document.addEventListener('pointerup', () => {
    cursorRing.classList.remove('is-down');
    cursorDot.classList.remove('is-down');
  });

  document.documentElement.addEventListener('mouseleave', () => {
    body.classList.remove('cursor-visible');
    if (pointerState) pointerState.textContent = 'idle';
  });

  window.addEventListener('blur', () => body.classList.remove('cursor-visible'));
  window.requestAnimationFrame(renderCursor);
}

function initMagneticControls() {
  if (!finePointer.matches || reduceMotion) return;

  magneticTargets.forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);
      const pull = element.classList.contains('project-link') ? 0.16 : 0.22;
      element.style.translate = `${(x * pull).toFixed(1)}px ${(y * pull).toFixed(1)}px`;
    });

    element.addEventListener('pointerleave', () => {
      element.style.translate = '0px 0px';
    });
  });
}

function initTiltCards() {
  if (!finePointer.matches || reduceMotion) return;

  tiltTargets.forEach((target) => {
    target.addEventListener('pointermove', (event) => {
      const rect = target.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const strength = target.classList.contains('photo-frame') ? 5.2 : 3.2;
      target.style.setProperty('--tilt-x', `${((0.5 - y) * strength).toFixed(2)}deg`);
      target.style.setProperty('--tilt-y', `${((x - 0.5) * strength).toFixed(2)}deg`);
      target.style.setProperty('--shine-x', `${(x * 100).toFixed(1)}%`);
      target.style.setProperty('--shine-y', `${(y * 100).toFixed(1)}%`);
    });

    target.addEventListener('pointerleave', () => {
      target.style.setProperty('--tilt-x', '0deg');
      target.style.setProperty('--tilt-y', '0deg');
      target.style.setProperty('--shine-x', '50%');
      target.style.setProperty('--shine-y', '50%');
    });
  });
}

function initNameScramble() {
  const heading = document.querySelector('[data-scramble]');
  const textNode = heading?.firstChild;
  if (!heading || !textNode || reduceMotion) return;

  const original = textNode.nodeValue;
  const glyphs = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  let animationFrame;

  const scramble = () => {
    window.cancelAnimationFrame(animationFrame);
    const started = performance.now();
    const duration = 520;

    const draw = (now) => {
      const progress = Math.min((now - started) / duration, 1);
      const solved = Math.floor(progress * original.length);
      textNode.nodeValue = [...original].map((character, index) => {
        if (character === ' ' || index < solved) return character;
        return glyphs[Math.floor(Math.random() * glyphs.length)];
      }).join('');

      if (progress < 1) animationFrame = window.requestAnimationFrame(draw);
      else textNode.nodeValue = original;
    };

    animationFrame = window.requestAnimationFrame(draw);
  };

  heading.addEventListener('pointerenter', scramble);
}

function initProjectCards() {
  projectItems.forEach((card) => {
    const destination = card.dataset.projectUrl;
    if (!destination) return;

    card.addEventListener('click', (event) => {
      if (event.target.closest('a, button')) return;
      window.location.href = destination;
    });

    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      window.location.href = destination;
    });
  });
}

shareButton?.addEventListener('click', async () => {
  try {
    if (navigator.share) {
      await navigator.share({ title: document.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showToast('link copied');
    }
  } catch (error) {
    if (error?.name !== 'AbortError') showToast('could not share link');
  }
});

copyButton?.addEventListener('click', async () => {
  const text = introCopy?.innerText.trim();
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    showToast('introduction copied');
  } catch {
    showToast('could not copy text');
  }
});

pushSections.forEach((section) => {
  section.querySelectorAll('.drop-item').forEach((item, index) => {
    item.style.setProperty('--delay', `${index * 95}ms`);
  });
});

if ('IntersectionObserver' in window) {
  const sectionReveal = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        sectionReveal.unobserve(entry.target);
      });
    },
    { threshold: 0.06, rootMargin: '0px 0px -12% 0px' },
  );

  pushSections.forEach((section) => sectionReveal.observe(section));
} else {
  pushSections.forEach((section) => section.classList.add('visible'));
}

window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', () => window.requestAnimationFrame(updateScrollScene));

window.addEventListener('pointermove', (event) => {
  if (!robot || reduceMotion) return;
  const x = Math.max(-1.5, Math.min(1.5, (event.clientX / window.innerWidth - 0.5) * 3));
  const y = Math.max(-1, Math.min(1, (event.clientY / window.innerHeight - 0.5) * 2));
  robot.style.setProperty('--look-x', `${x.toFixed(1)}px`);
  robot.style.setProperty('--look-y', `${y.toFixed(1)}px`);
});

if (yearElement) yearElement.textContent = new Date().getFullYear();
updateTime();
window.setInterval(updateTime, 30_000);

initCustomCursor();
initMagneticControls();
initTiltCards();
initNameScramble();
initProjectCards();

window.requestAnimationFrame(() => {
  body.classList.add('ready');
  updateScrollScene();
});
