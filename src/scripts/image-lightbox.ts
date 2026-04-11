/**
 * Image lightbox: wheel zoom, pinch zoom, pan when zoomed, focus return, body scroll lock.
 * Binds once per root via data-lightbox-bound.
 */

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const WHEEL_SENS = 0.0015;
const CLOSE_MS = 320;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function bindRoot(root: HTMLElement) {
  const trigger = root.querySelector<HTMLButtonElement>('[data-lightbox-trigger]');
  const dialog = root.querySelector<HTMLDialogElement>('[data-lightbox-dialog]');
  const closeBtn = root.querySelector<HTMLButtonElement>('[data-lightbox-close]');
  const panel = root.querySelector<HTMLElement>('[data-lightbox-panel]');
  const pan = root.querySelector<HTMLElement>('[data-lightbox-pan]');
  const img = root.querySelector<HTMLImageElement>('[data-lightbox-img]');
  const scrim = root.querySelector<HTMLElement>('[data-lightbox-scrim]');

  if (!trigger || !dialog || !closeBtn || !panel || !pan || !img || !scrim) return;

  let scale = MIN_SCALE;
  let tx = 0;
  let ty = 0;
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

  let prevOverflow = '';

  const applyTransform = () => {
    pan.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  };

  const resetTransform = () => {
    scale = MIN_SCALE;
    tx = 0;
    ty = 0;
    applyTransform();
  };

  const finishClose = () => {
    document.body.style.overflow = prevOverflow;
    dialog.close();
    resetTransform();
    trigger.focus();
  };

  const close = () => {
    if (!dialog.open) return;
    trigger.setAttribute('aria-expanded', 'false');
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

  const open = () => {
    resetTransform();
    trigger.setAttribute('aria-expanded', 'true');
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    requestAnimationFrame(() => {
      panel.classList.add('is-open');
      closeBtn.focus();
    });
  };

  trigger.addEventListener('click', () => open());

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });

  scrim.addEventListener('click', () => close());

  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });

  pan.addEventListener(
    'wheel',
    (e) => {
      if (!dialog.open) return;
      e.preventDefault();
      const delta = -e.deltaY * WHEEL_SENS;
      const next = clamp(scale * (1 + delta), MIN_SCALE, MAX_SCALE);
      if (next === scale) return;
      scale = next;
      if (scale <= MIN_SCALE + 0.001) {
        tx = 0;
        ty = 0;
      }
      applyTransform();
    },
    { passive: false }
  );

  pan.addEventListener('pointerdown', (e) => {
    if (scale <= MIN_SCALE + 0.001) return;
    if (e.button !== 0) return;
    dragging = true;
    pan.setPointerCapture(e.pointerId);
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    panStartTx = tx;
    panStartTy = ty;
  });

  pan.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    tx = panStartTx + (e.clientX - dragStartX);
    ty = panStartTy + (e.clientY - dragStartY);
    applyTransform();
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
      if (e.touches.length === 2) {
        e.preventDefault();
        pinchStartDist = touchDist(e.touches);
        pinchStartScale = scale;
        const mid = touchMid(e.touches);
        pinchMidX = mid.x;
        pinchMidY = mid.y;
        pinchStartTx = tx;
        pinchStartTy = ty;
      }
    },
    { passive: false }
  );

  pan.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length === 2 && pinchStartDist > 0) {
        e.preventDefault();
        const dist = touchDist(e.touches);
        const factor = dist / pinchStartDist;
        scale = clamp(pinchStartScale * factor, MIN_SCALE, MAX_SCALE);
        const mid = touchMid(e.touches);
        tx = pinchStartTx + (mid.x - pinchMidX);
        ty = pinchStartTy + (mid.y - pinchMidY);
        applyTransform();
      }
    },
    { passive: false }
  );

  pan.addEventListener('touchend', () => {
    pinchStartDist = 0;
    if (scale <= MIN_SCALE + 0.001) {
      tx = 0;
      ty = 0;
      applyTransform();
    }
  });
}

export function initImageLightboxes() {
  document.querySelectorAll<HTMLElement>('[data-image-lightbox]:not([data-lightbox-bound])').forEach((root) => {
    root.dataset.lightboxBound = 'true';
    bindRoot(root);
  });
}

export function initImageLightboxesOnReady() {
  const run = () => initImageLightboxes();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
  const g = globalThis as typeof globalThis & { __portfolioImageLbAstro?: boolean };
  if (!g.__portfolioImageLbAstro) {
    g.__portfolioImageLbAstro = true;
    document.addEventListener('astro:page-load', run);
  }
}
