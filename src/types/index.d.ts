import type { Router } from 'vue-router';

export type SiteSearchReturn = { keyword: string; category?: string; resultsCount?: number };
export type SiteSearchFunction = (to: any) => SiteSearchReturn | null;

export interface MatomoDefaults {
  async?: boolean;
  trackerFileName?: string;
  trackerUrl?: string;
  trackerScriptUrl?: string;
  router?: Router;
  enableLinkTracking?: boolean;
  requireConsent?: boolean;
  trackInitialView?: boolean;
  disableCookies?: boolean;
  requireCookieConsent?: boolean;
  enableHeartBeatTimer?: boolean;
  heartBeatTimerInterval?: number;
  debug?: boolean;
  userId?: string;
  cookieDomain?: string;
  domains?: string;
  preInitActions?: Array<[string, ...any[]]>;
  trackSiteSearch?: SiteSearchFunction;
  crossOrigin?: 'anonymous' | 'use-credentials';
}

export interface MatomoOptions extends MatomoDefaults {
  host: string;
  siteId: number;
}

export interface MatomoInstance {
  trackEvent(category: string, action: string, name?: string, value?: number): void;
  trackPageView(customTitle?: string): void;
  trackSiteSearch(keyword: string, category?: string, resultsCount?: number): void;
  trackLink(url: string, linkType: string): void;
  setReferrerUrl(url: string): void;
  setCustomUrl(url: string): void;
  enableLinkTracking(): void;
  optUserOut(): void;
  forgetUserOptOut(): void;
  disableCookies(): void;
  isUserOptedOut(): boolean;
  setUserId(userId: string): void;
  rememberConsentGiven(hours?: number): void;
  setCookieDomain(domain: string): void;
  [key: string]: any; // Allow any method beyond these
}
