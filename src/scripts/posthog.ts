import posthog from 'posthog-js';

const key = import.meta.env.PUBLIC_POSTHOG_KEY as string | undefined;
/** EU PostHog Cloud; override with PUBLIC_POSTHOG_HOST if you use a reverse proxy. */
const apiHost =
  (import.meta.env.PUBLIC_POSTHOG_HOST as string | undefined) ?? 'https://eu.i.posthog.com';

function init(): void {
  if (!key) return;

  posthog.init(key, {
    api_host: apiHost,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init(), { once: true });
  } else {
    init();
  }
}
