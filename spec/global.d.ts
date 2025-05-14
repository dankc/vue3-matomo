import type { MatomoInstance } from '@/types';

declare global {
  interface Window {
    Piwik?: {
      getAsyncTracker: () => MatomoInstance;
      // Add other methods as needed
    };
    _paq: any[];
  }
}
