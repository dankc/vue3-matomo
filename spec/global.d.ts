import type { MatomoInstance } from '@/types';

declare global {
  interface Window {
    Piwik?: {
      getAsyncTracker: () => MatomoInstance;
    };
    _paq: any[];
  }
}
