import type { MatomoInstance } from '@/types/index';

declare global {
  interface Window {
    _paq?: Array<(string | number | object)[]>;
    Piwik?: {
      getAsyncTracker: () => MatomoInstance;
    };
  }
}
