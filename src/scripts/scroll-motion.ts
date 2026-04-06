/**
 * IntersectionObserver-based scroll reveals (once) + light parallax on [data-parallax].
 * Respects prefers-reduced-motion; uses passive scroll + rAF for parallax.
 */

const VISIBLE_CLASS = 'scroll-motion--visible';
const ACTIVE_CLASS = 'scroll-motion--active';
const REDUCED_CLASS = 'scroll-motion--prefers-reduced';
const PARALLAX_ON_CLASS = 'scroll-motion--parallax-on';

const ioOptions: IntersectionObserverInit = {
  root: null,
  rootMargin: '0px 0px -6% 0px',
  threshold: 0.06,
};

function isInViewport(el: Element): boolean {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  return r.top < vh * 0.92 && r.bottom > vh * 0.08;
}

function markVisibleIfInView(nodes: NodeListOf<HTMLElement>): void {
  nodes.forEach((el) => {
    if (isInViewport(el)) el.classList.add(VISIBLE_CLASS);
  });
}

function initReveals(): void {
  const reveal = document.querySelectorAll<HTMLElement>('[data-reveal]');
  const stagger = document.querySelectorAll<HTMLElement>('[data-reveal-stagger]');

  const io = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      (entry.target as HTMLElement).classList.add(VISIBLE_CLASS);
      obs.unobserve(entry.target);
    }
  }, ioOptions);

  markVisibleIfInView(reveal);
  reveal.forEach((el) => {
    if (!el.classList.contains(VISIBLE_CLASS)) io.observe(el);
  });

  markVisibleIfInView(stagger);
  stagger.forEach((el) => {
    if (!el.classList.contains(VISIBLE_CLASS)) io.observe(el);
  });
}

function initParallax(): (() => void) | void {
  const nodes = document.querySelectorAll<HTMLElement>('[data-parallax]');
  if (nodes.length === 0) return;

  document.documentElement.classList.add(PARALLAX_ON_CLASS);

  let scheduled = 0;

  const tick = (): void => {
    scheduled = 0;
    const vh = window.innerHeight;
    const narrow = window.matchMedia('(max-width: 767px)').matches;
    const maxPx = narrow ? 5 : 14;

    nodes.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      const center = rect.top + rect.height / 2;
      const t = (center - vh * 0.5) / (vh * 0.9);
      const clamped = Math.max(-1, Math.min(1, t));
      const y = clamped * maxPx * -0.45;
      el.style.setProperty('--scroll-parallax-y', `${y}px`);
    });
  };

  const onScrollOrResize = (): void => {
    if (scheduled) return;
    scheduled = requestAnimationFrame(tick);
  };

  tick();
  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });

  return () => {
    window.removeEventListener('scroll', onScrollOrResize);
    window.removeEventListener('resize', onScrollOrResize);
    document.documentElement.classList.remove(PARALLAX_ON_CLASS);
  };
}

export function initScrollMotion(): void {
  const root = document.documentElement;

  const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const applyReduced = (): void => {
    if (reducedMq.matches) {
      root.classList.add(REDUCED_CLASS);
      root.classList.remove(ACTIVE_CLASS);
    } else {
      root.classList.remove(REDUCED_CLASS);
      root.classList.add(ACTIVE_CLASS);
    }
  };

  applyReduced();
  reducedMq.addEventListener('change', applyReduced);

  if (reducedMq.matches) {
    document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-stagger]').forEach((el) => {
      el.classList.add(VISIBLE_CLASS);
    });
    return;
  }

  initReveals();
  initParallax();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initScrollMotion(), { once: true });
  } else {
    initScrollMotion();
  }
}
