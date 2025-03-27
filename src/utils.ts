import type { App } from 'vue';
import type { Router } from 'vue-router';
import type { MatomoInstance } from '@/types/index';

type MatomoEvents = {
  'matomo:loaded': void;
  'matomo:failed': void;
};

interface EventEmitter {
  listeners: Map<string, Array<(payload: any) => void>>;
  on<Event extends keyof MatomoEvents>(event: Event, callback: (payload: MatomoEvents[Event]) => void): void;
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
  emit(event, payload) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((callback) => callback(payload));
  },
};

function getMatomo(): MatomoInstance | undefined {
  return window.Piwik?.getAsyncTracker();
}

function loadScript(
  app: App,
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
      reject();
    };
  });
}

function getResolvedHref(router: Router, path: string): string {
  return router.resolve(path).href;
}

export { getMatomo, loadScript, getResolvedHref, eventEmitter as matomoEvents };
