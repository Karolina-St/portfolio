/**
 * Accessible tablist for [data-fun-tabs]: click + arrow keys, Home/End.
 */

function initFunTabs(): void {
  const root = document.querySelector('[data-fun-tabs]');
  if (!root) return;
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
  const list = root.querySelector('[role="tablist"]');

  function select(index: number): void {
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute('aria-selected', String(on));
      tab.setAttribute('data-active', String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    panels.forEach((panel, i) => {
      if (i === index) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      select(i);
      tab.focus();
    });
  });

  list?.addEventListener('keydown', (e) => {
    const ev = e as KeyboardEvent;
    const i = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    if (i < 0) return;
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') {
      ev.preventDefault();
      const next = (i + 1) % tabs.length;
      select(next);
      tabs[next].focus();
    } else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') {
      ev.preventDefault();
      const prev = (i - 1 + tabs.length) % tabs.length;
      select(prev);
      tabs[prev].focus();
    } else if (ev.key === 'Home') {
      ev.preventDefault();
      select(0);
      tabs[0].focus();
    } else if (ev.key === 'End') {
      ev.preventDefault();
      const last = tabs.length - 1;
      select(last);
      tabs[last].focus();
    }
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initFunTabs(), { once: true });
  } else {
    initFunTabs();
  }
}
