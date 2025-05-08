import type { Router } from 'vue-router';
import type { MatomoInstance } from '@/types/index';

type MatomoEvents = {
  'matomo:loaded': void;
  'matomo:failed': void;
};

interface EventEmitter {
  listeners: Map<string, Array<(payload: any) => void>>;
  on<Event extends keyof MatomoEvents>(event: Event, callback: (payload: MatomoEvents[Event]) => void): void;
  off<Event extends keyof MatomoEvents>(event: Event, callback: (payload: MatomoEvents[Event]) => void): void;
  emit<Event extends keyof MatomoEvents>(event: Event, payload?: MatomoEvents[Event]): void;
}

const eventEmitter: EventEmitter = {
  listeners: new Map(),
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  },
  off(event: keyof MatomoEvents, callback: (payload: any) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      this.listeners.set(event, callbacks.filter(cb => cb !== callback));
    }
  },
  emit(event, payload) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((callback) => callback(payload));
  },
};

const isClient = (): boolean => typeof window !== 'undefined';

function getMatomo(): MatomoInstance | undefined {
  return window.Piwik?.getAsyncTracker();
}

function loadScript(
  trackerScript: string,
  { async, crossOrigin }: { async?: boolean; crossOrigin?: 'anonymous' | 'use-credentials' }
): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = async || false;
    script.defer = async || false;
    script.src = trackerScript;

    if (crossOrigin && ['anonymous', 'use-credentials'].includes(crossOrigin)) {
      script.crossOrigin = crossOrigin;
    }

    const head = document.head || document.getElementsByTagName('head')[0];
    head.appendChild(script);

    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      eventEmitter.emit('matomo:failed');
      reject(new Error('[vue-matomo]: Matomo script failed to load.'));
    };
  });
}

function getResolvedHref(router: Router, path: string): string {
  return router.resolve(path).href;
}

export { isClient, getMatomo, loadScript, getResolvedHref, eventEmitter as matomoEvents };
