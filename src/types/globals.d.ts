import type { MatomoInstance } from '@/index';

declare global {
  interface Window {
    _paq?: Array<(string | number | object)[]>;
    Piwik?: {
      getAsyncTracker: () => MatomoInstance;
    };
  }
}
