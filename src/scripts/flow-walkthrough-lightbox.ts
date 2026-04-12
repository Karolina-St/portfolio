/**
 * Flow walkthrough: one modal with a carousel of full-size images, wheel/pinch zoom and pan on the active slide.
 */

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const WHEEL_SENS = 0.0015;
const CLOSE_MS = 320;
const SWIPE_PX = 56;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function initFlowWalkthroughLightbox(root: HTMLElement) {
  if (root.hasAttribute('data-flow-wt-lb-bound')) return;

  const dialog = root.querySelector<HTMLDialogElement>('[data-wt-lb-dialog]');
  const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-wt-lb-slide]'));
  const triggers = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-wt-lb-open]'));
  const closeBtn = root.querySelector<HTMLButtonElement>('[data-wt-lb-close]');
  const prevBtn = root.querySelector<HTMLButtonElement>('[data-wt-lb-prev]');
  const nextBtn = root.querySelector<HTMLButtonElement>('[data-wt-lb-next]');
  const panel = root.querySelector<HTMLElement>('[data-wt-lb-panel]');
  const scrim = root.querySelector<HTMLElement>('[data-wt-lb-scrim]');
  const counter = root.querySelector<HTMLElement>('[data-wt-lb-counter]');
  const viewport = root.querySelector<HTMLElement>('[data-wt-lb-viewport]');

  if (!dialog || !slides.length || !closeBtn || !panel || !scrim || !viewport) return;

  root.setAttribute('data-flow-wt-lb-bound', 'true');

  const n = slides.length;
  const pans = slides.map((s) => s.querySelector<HTMLElement>('[data-lb-pan]'));
  if (pans.some((p) => !p)) return;

  let activeSlide = 0;
  let lastTrigger: HTMLButtonElement | null = null;
  let prevOverflow = '';

  const scales = pans.map(() => MIN_SCALE);
  const txs = pans.map(() => 0);
  const tys = pans.map(() => 0);

  const applyPanTransform = (i: number) => {
    const pan = pans[i];
    if (!pan) return;
    pan.style.transform = `translate(${txs[i]}px, ${tys[i]}px) scale(${scales[i]})`;
  };

  const resetPan = (i: number) => {
    scales[i] = MIN_SCALE;
    txs[i] = 0;
    tys[i] = 0;
    applyPanTransform(i);
  };

  const resetAllPans = () => {
    for (let i = 0; i < n; i++) resetPan(i);
  };

  const updateCounter = () => {
    if (counter) counter.textContent = `${activeSlide + 1} / ${n}`;
    if (prevBtn) prevBtn.disabled = activeSlide <= 0;
    if (nextBtn) nextBtn.disabled = activeSlide >= n - 1;
  };

  const goToSlide = (index: number) => {
    activeSlide = clamp(index, 0, n - 1);
    slides.forEach((slide, j) => {
      const isActive = j === activeSlide;
      slide.classList.toggle('opacity-100', isActive);
      slide.classList.toggle('opacity-0', !isActive);
      slide.classList.toggle('pointer-events-none', !isActive);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
    updateCounter();
    for (let j = 0; j < n; j++) {
      if (j !== activeSlide) resetPan(j);
    }
  };

  const finishClose = () => {
    document.body.style.overflow = prevOverflow;
    dialog.close();
    resetAllPans();
    goToSlide(0);
    lastTrigger?.focus();
    lastTrigger = null;
    triggers.forEach((t) => t.setAttribute('aria-expanded', 'false'));
  };

  const close = () => {
    if (!dialog.open) return;
    panel.classList.remove('is-open');
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      finishClose();
    };
    window.setTimeout(done, CLOSE_MS);
    panel.addEventListener(
      'transitionend',
      (e) => {
        if (e.target === panel) done();
      },
      { once: true }
    );
  };

  const open = (startIndex: number, trigger: HTMLButtonElement) => {
    resetAllPans();
    lastTrigger = trigger;
    activeSlide = clamp(startIndex, 0, n - 1);
    goToSlide(activeSlide);
    updateCounter();
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    triggers.forEach((t) => t.setAttribute('aria-expanded', 'false'));
    trigger.setAttribute('aria-expanded', 'true');
    dialog.showModal();
    requestAnimationFrame(() => {
      panel.classList.add('is-open');
      closeBtn.focus();
    });
  };

  triggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-wt-lb-index') ?? '0', 10);
      open(idx, btn);
    });
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });

  scrim.addEventListener('click', () => close());

  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });

  prevBtn?.addEventListener('click', () => goToSlide(activeSlide - 1));
  nextBtn?.addEventListener('click', () => goToSlide(activeSlide + 1));

  dialog.addEventListener('keydown', (e) => {
    if (!dialog.open) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToSlide(activeSlide - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToSlide(activeSlide + 1);
    }
  });

  let swipeStartX = 0;
  viewport.addEventListener(
    'touchstart',
    (e) => {
      const t = e.changedTouches[0];
      if (t) swipeStartX = t.screenX;
    },
    { passive: true }
  );
  viewport.addEventListener(
    'touchend',
    (e) => {
      if (scales[activeSlide] > MIN_SCALE + 0.02) return;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.screenX - swipeStartX;
      if (Math.abs(dx) < SWIPE_PX) return;
      if (dx < 0) goToSlide(activeSlide + 1);
      else goToSlide(activeSlide - 1);
    },
    { passive: true }
  );

  pans.forEach((pan, i) => {
    if (!pan) return;

    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let panStartTx = 0;
    let panStartTy = 0;
    let pinchStartDist = 0;
    let pinchStartScale = MIN_SCALE;
    let pinchMidX = 0;
    let pinchMidY = 0;
    let pinchStartTx = 0;
    let pinchStartTy = 0;

    pan.addEventListener(
      'wheel',
      (e) => {
        if (!dialog.open || i !== activeSlide) return;
        e.preventDefault();
        const delta = -e.deltaY * WHEEL_SENS;
        const next = clamp(scales[i] * (1 + delta), MIN_SCALE, MAX_SCALE);
        if (next === scales[i]) return;
        scales[i] = next;
        if (scales[i] <= MIN_SCALE + 0.001) {
          txs[i] = 0;
          tys[i] = 0;
        }
        applyPanTransform(i);
      },
      { passive: false }
    );

    pan.addEventListener('pointerdown', (e) => {
      if (!dialog.open || i !== activeSlide) return;
      if (scales[i] <= MIN_SCALE + 0.001) return;
      if (e.button !== 0) return;
      dragging = true;
      pan.setPointerCapture(e.pointerId);
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      panStartTx = txs[i];
      panStartTy = tys[i];
    });

    pan.addEventListener('pointermove', (e) => {
      if (!dragging || i !== activeSlide) return;
      txs[i] = panStartTx + (e.clientX - dragStartX);
      tys[i] = panStartTy + (e.clientY - dragStartY);
      applyPanTransform(i);
    });

    const endDrag = () => {
      dragging = false;
    };
    pan.addEventListener('pointerup', endDrag);
    pan.addEventListener('pointercancel', endDrag);

    const touchDist = (touches: TouchList) => {
      if (touches.length < 2) return 0;
      const a = touches[0];
      const b = touches[1];
      const dx = a.clientX - b.clientX;
      const dy = a.clientY - b.clientY;
      return Math.hypot(dx, dy);
    };

    const touchMid = (touches: TouchList) => {
      const a = touches[0];
      const b = touches[1];
      return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
    };

    pan.addEventListener(
      'touchstart',
      (e) => {
        if (!dialog.open || i !== activeSlide) return;
        if (e.touches.length === 2) {
          e.preventDefault();
          pinchStartDist = touchDist(e.touches);
          pinchStartScale = scales[i];
          const mid = touchMid(e.touches);
          pinchMidX = mid.x;
          pinchMidY = mid.y;
          pinchStartTx = txs[i];
          pinchStartTy = tys[i];
        }
      },
      { passive: false }
    );

    pan.addEventListener(
      'touchmove',
      (e) => {
        if (!dialog.open || i !== activeSlide) return;
        if (e.touches.length === 2 && pinchStartDist > 0) {
          e.preventDefault();
          const dist = touchDist(e.touches);
          const factor = dist / pinchStartDist;
          scales[i] = clamp(pinchStartScale * factor, MIN_SCALE, MAX_SCALE);
          const mid = touchMid(e.touches);
          txs[i] = pinchStartTx + (mid.x - pinchMidX);
          tys[i] = pinchStartTy + (mid.y - pinchMidY);
          applyPanTransform(i);
        }
      },
      { passive: false }
    );

    pan.addEventListener('touchend', () => {
      pinchStartDist = 0;
      if (scales[i] <= MIN_SCALE + 0.001) {
        txs[i] = 0;
        tys[i] = 0;
        applyPanTransform(i);
      }
    });
  });
}

export function initFlowWalkthroughLightboxesOnReady() {
  const run = () => {
    document.querySelectorAll<HTMLElement>('[data-flow-walkthrough]').forEach((root) => {
      initFlowWalkthroughLightbox(root);
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
  const g = globalThis as typeof globalThis & { __portfolioFlowWtLbAstro?: boolean };
  if (!g.__portfolioFlowWtLbAstro) {
    g.__portfolioFlowWtLbAstro = true;
    document.addEventListener('astro:page-load', run);
  }
}
