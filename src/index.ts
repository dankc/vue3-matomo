import { inject, ref, type App, type InjectionKey, type Ref } from 'vue';
import type { RouteLocationNormalized } from 'vue-router';
import type { MatomoDefaults, MatomoOptions, MatomoInstance, SiteSearchReturn } from '@/types/index';
import { isClient, getMatomo, getResolvedHref, loadScript, matomoEvents } from '@/utils';

const defaultOptions: MatomoDefaults = {
  async: true,
  debug: false,
  disableCookies: false,
  requireCookieConsent: false,
  enableHeartBeatTimer: false,
  enableLinkTracking: true,
  heartBeatTimerInterval: 15,
  requireConsent: false,
  trackInitialView: true,
  trackerFileName: 'matomo',
  trackerUrl: undefined,
  trackerScriptUrl: undefined,
  userId: undefined,
  cookieDomain: undefined,
  domains: undefined,
  preInitActions: [],
  trackSiteSearch: undefined,
  crossOrigin: undefined,
};

function trackUserInteraction(
  Matomo: MatomoInstance | undefined,
  options: MatomoOptions,
  to: RouteLocationNormalized,
  from?: RouteLocationNormalized
) {
  if (options.trackSiteSearch) {
    const siteSearch = options.trackSiteSearch(to);
    if (siteSearch) {
      trackMatomoSiteSearch(Matomo, options, siteSearch);
      return;
    }
  }
  trackMatomoPageView(Matomo, options, to, from);
}

function trackMatomoSiteSearch(
  Matomo: MatomoInstance | undefined,
  options: MatomoOptions,
  { keyword, category, resultsCount }: SiteSearchReturn
) {
  options.debug && console.debug('[vue-matomo] Site Search ' + keyword);
  Matomo?.trackSiteSearch(keyword, category, resultsCount);
}

function trackMatomoPageView(
  Matomo: MatomoInstance | undefined,
  options: MatomoOptions,
  to: RouteLocationNormalized,
  from?: RouteLocationNormalized
) {
  let title: string | undefined;
  let url: string | undefined;
  let referrerUrl: string | undefined;

  if (options.router) {
    url = getResolvedHref(options.router, to.fullPath);
    referrerUrl = from?.fullPath ? getResolvedHref(options.router, from.fullPath) : undefined;

    if (to.meta.analyticsIgnore) {
      options.debug && console.debug('[vue-matomo] Ignoring ' + url);
      return;
    }

    title = (to.meta.title as string | undefined) || url;
  }

  if (referrerUrl) {
    Matomo?.setReferrerUrl(window.location.origin + referrerUrl);
  }
  if (url) {
    Matomo?.setCustomUrl(window.location.origin + url);
  }

  options.debug && console.debug('[vue-matomo] Tracking ' + title);
  Matomo?.trackPageView(title);
}

function initMatomo(
  Vue: App,
  options: MatomoOptions,
  MatomoRef: Ref<MatomoInstance | undefined>,
  Matomo: MatomoInstance | undefined
) {
  Matomo = getMatomo();

  // For Composition API users using the Provide
  MatomoRef.value = Matomo;
  // For Options API users
  Vue.config.globalProperties.$piwik = Matomo;
  Vue.config.globalProperties.$matomo = Matomo;

  if (options.trackInitialView && options.router) {
    const currentRoute: RouteLocationNormalized = options.router.currentRoute.value;
    trackUserInteraction(Matomo, options, currentRoute);
  }

  if (options.router) {
    options.router.afterEach((to: RouteLocationNormalized, from: RouteLocationNormalized) => {
      trackUserInteraction(Matomo, options, to, from);

      if (options.enableLinkTracking) {
        Matomo?.enableLinkTracking();
      }
    });
  }
}

function piwikExists(): Promise<void> {
  return new Promise((resolve) => {
    const checkInterval = 50;
    const timeout = 3000;
    const waitStart = Date.now();

    const interval = setInterval(() => {
      if (window.Piwik) {
        clearInterval(interval);
        return resolve();
      }

      if (Date.now() >= waitStart + timeout) {
        clearInterval(interval);
        throw new Error(`[vue-matomo]: window.Piwik undefined after waiting for ${timeout}ms`);
      }
    }, checkInterval);
  });
}

function install(
  Vue: App,
  setupOptions: MatomoOptions,
  MatomoRef: Ref<MatomoInstance | undefined>,
  Matomo: MatomoInstance | undefined
) {
  if( !isClient() ) return;
  const options: MatomoOptions = Object.assign({}, defaultOptions, setupOptions);

  const { async, crossOrigin, host, siteId, trackerFileName, trackerUrl, trackerScriptUrl } = options;
  const trackerScript = trackerScriptUrl || `${host}/${trackerFileName}.js`;
  const trackerEndpoint = trackerUrl || `${host}/${trackerFileName}.php`;

  Vue.provide(matomoKey, MatomoRef);

  window._paq = window._paq || [];

  window._paq.push(['setTrackerUrl', trackerEndpoint]);
  window._paq.push(['setSiteId', siteId]);

  if (options.requireConsent) {
    window._paq.push(['requireConsent']);
  }

  if (options.userId) {
    window._paq.push(['setUserId', options.userId]);
  }

  if (options.enableLinkTracking) {
    window._paq.push(['enableLinkTracking']);
  }

  if (options.disableCookies) {
    window._paq.push(['disableCookies']);
  }

  if (options.requireCookieConsent) {
    window._paq.push(['requireCookieConsent']);
  }

  if (options.enableHeartBeatTimer && options.heartBeatTimerInterval) {
    window._paq.push(['enableHeartBeatTimer', options.heartBeatTimerInterval]);
  }

  if (options.cookieDomain) {
    window._paq.push(['setCookieDomain', options.cookieDomain]);
  }

  if (options.domains) {
    window._paq.push(['setDomains', options.domains]);
  }

  options.preInitActions?.forEach((action) => window._paq?.push(action));

  loadScript(trackerScript, { async, crossOrigin })
    .then(() => piwikExists())
    .then(() => {
      initMatomo(Vue, options, MatomoRef, Matomo);
      matomoEvents.emit('matomo:loaded');
    })
    .catch((error) => {
      matomoEvents.emit('matomo:failed');

      if (error.target) {
        return console.error(
          `[vue-matomo] An error occurred trying to load ${error.target.src}. ` +
            'If the file exists you may have an ad or tracking blocker enabled.'
        );
      }

      console.error(error);
    });
}

export function createVueMatomo(options: MatomoOptions) {
  const MatomoRef = ref<MatomoInstance | undefined>();
  let Matomo: MatomoInstance | undefined;
  return {
    install: (app: App) => install(app, options, MatomoRef, Matomo),
  };
}

export function useMatomo(): Ref<MatomoInstance | undefined> {
  if( !isClient() ) return ref();
  const matomo = inject(matomoKey);
  return matomo as Ref<MatomoInstance | undefined>; // Assert it’s always provided
}

export const matomoKey: InjectionKey<Ref<MatomoInstance | undefined>> = Symbol('Matomo');
export type { MatomoOptions, SiteSearchFunction, MatomoInstance } from '@/types/index';
export { matomoEvents, isClient } from '@/utils';
