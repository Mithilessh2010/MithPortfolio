(() => {
  const finePointer = matchMedia('(pointer: fine)').matches;
  if (!finePointer) return;

  const root = document.documentElement;
  root.classList.add('custom-cursor');

  const dot = document.createElement('div');
  const halo = document.createElement('div');
  dot.className = 'cursor-dot';
  halo.className = 'cursor-halo';
  dot.setAttribute('aria-hidden', 'true');
  halo.setAttribute('aria-hidden', 'true');
  document.body.append(dot, halo);

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let tx = -100, ty = -100;
  let hx = -100, hy = -100;
  let raf = 0;

  const render = () => {
    if (reduceMotion) {
      hx = tx; hy = ty;
    } else {
      hx += (tx - hx) * .19;
      hy += (ty - hy) * .19;
    }

    dot.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
    halo.style.transform = `translate3d(${hx}px, ${hy}px, 0) translate(-50%, -50%)`;

    if (!reduceMotion && (Math.abs(tx - hx) > .08 || Math.abs(ty - hy) > .08)) {
      raf = requestAnimationFrame(render);
    } else {
      raf = 0;
    }
  };

  const queue = () => {
    if (!raf) raf = requestAnimationFrame(render);
  };

  const classify = (target) => {
    if (!(target instanceof Element)) return;
    const interactive = target.closest('a, button, input, select, textarea, summary, label, [role="button"], [tabindex]:not([tabindex="-1"])');
    const textual = !interactive && target.closest('p, h1, h2, h3, h4, h5, h6, li, dt, dd, blockquote, code, pre, strong, em, small, .hero-name, .hero-tagline, .section-label');
    root.classList.toggle('cursor-link', Boolean(interactive));
    root.classList.toggle('cursor-text', Boolean(textual));
  };

  addEventListener('pointermove', (event) => {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    tx = event.clientX;
    ty = event.clientY;
    root.classList.add('cursor-visible');
    classify(event.target);
    queue();
  }, { passive: true });

  addEventListener('pointerdown', () => root.classList.add('cursor-down'), { passive: true });
  addEventListener('pointerup', () => root.classList.remove('cursor-down'), { passive: true });
  addEventListener('blur', () => root.classList.remove('cursor-visible'));
  document.addEventListener('mouseleave', () => root.classList.remove('cursor-visible'));
  document.addEventListener('mouseenter', () => root.classList.add('cursor-visible'));
})();
