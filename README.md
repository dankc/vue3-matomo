# Vue3-Matomo

[![vue 3](https://img.shields.io/badge/vue-3.x-green.svg)](https://v3.vuejs.org/)
[![nuxt 3](https://img.shields.io/badge/nuxt-3.x-green.svg)](https://nuxt.com/)
[![TypeScript](https://img.shields.io/badge/types-TypeScript-blue.svg)](https://v3.vuejs.org/)
[![npm](https://img.shields.io/npm/dm/vue3-matomo.svg)](https://www.npmjs.com/package/vue3-matomo)
[![bundle-size](https://badgen.net/bundlephobia/min/vue3-matomo)](https://bundlephobia.com/result?p=vue3-matomo)
[![license](https://img.shields.io/github/license/dankc/vue3-matomo)](LICENSE)


A Vue 3 plugin for Matomo analytics with TypeScript support. This package is a fork of [vue-matomo](https://github.com/AmazingDreams/vue-matomo) by Dennis Ruhe, rewritten in TypeScript to target Vue 3, supports Composition and Options APIs, with event emits for script loading. This plugin can also be used in Nuxt 3.

## Features
- Vue 3 and Nuxt 3 support with TypeScript
- Access the Matomo instance via `this.$matomo` (Options API), `useMatomo` (Composition API) , or `inject` (Composition API)
- Emits events for script loading (`matomo:loaded`, `matomo:failed`)
- Compatible with `vue-router@4`

## Installation
```bash
npm install vue3-matomo
```

## Usage

### Basic Setup

#### Vue
```ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createVueMatomo } from 'vue3-matomo';

const app = createApp(App);

app.use(router);
app.use(createVueMatomo({
  host: 'https://your-matomo-instance.com',
  siteId: 1,
  router,
}));

app.mount('#app');
```

#### Nuxt
This plugin also works with Nuxt 3 and the API is exactly the same as it is for Vue. Be sure to use the `.client` suffix in your file name to prevent it from running server-side.
```ts
// ./plugins/matomo.client.ts
import { createVueMatomo } from 'vue3-matomo';

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter(); // Access the router with this composable and provide it to your options object if you want automatic page tracking

  nuxtApp.vueApp.use(
    createVueMatomo({
      router,
      // ...The rest of your options
    })
  );
});

```

### Options

```ts
interface MathomoOptions {
  // Configure your matomo server and site by providing
  // Example: 'https://matomo.example.com'
  host: string,
  siteId: number,

  // Enable/Disable aysnc loading of the matomo script
  // Default: true
  async?: boolean

  // Changes the default .js and .php endpoint's filename
  // Default: 'matomo'
  trackerFileName?: string,

  // Overrides the autogenerated tracker endpoint entirely
  // Default: undefined
  trackerUrl?: string,

  // Overrides the autogenerated tracker script path entirely
  // Default: undefined
  trackerScriptUrl?: string,

  // Enables automatically registering pageviews on the router
  router?: Router,

  // Enables link tracking on regular links. Note that this won't
  // work for routing links (ie. internal Vue router links)
  // Default: true
  enableLinkTracking?: boolean,

  // Require consent before sending tracking information to matomo
  // Default: false
  requireConsent?: boolean,

  // Whether to track the initial page view. Router must be provided.
  // Default: true
  trackInitialView?: boolean,

  // Run Matomo without cookies
  // Default: false
  disableCookies?: boolean,

  // Require consent before creating matomo session cookie
  // Default: false
  requireCookieConsent?: boolean,

  // Enable the heartbeat timer (https://developer.matomo.org/guides/tracking-javascript-guide#accurately-measure-the-time-spent-on-each-page)
  // Default: false
  enableHeartBeatTimer?: boolean,

  // Set the heartbeat timer interval
  // Default: 15
  heartBeatTimerInterval?: number,

  // Whether or not to log debug information
  // Default: false
  debug?: boolean,

  // UserID passed to Matomo (see https://developer.matomo.org/guides/tracking-javascript-guide#user-id)
  // Default: undefined
  userId?: string,

  // Share the tracking cookie across subdomains (see https://developer.matomo.org/guides/tracking-javascript-guide#measuring-domains-andor-sub-domains)
  // Default: undefined, example '*.example.com'
  cookieDomain?: string,

  // Tell Matomo the website domain so that clicks on these domains are not tracked as 'Outlinks'
  // Default: undefined, example: '*.example.com'
  domains?: string,

  // A list of pre-initialization actions that run before matomo is loaded
  // Default: []
  // Example: [
  //   ['API_method_name', parameter_list],
  //   ['setCustomVariable','1','VisitorType','Member'],
  //   ['appendToTrackingUrl', 'new_visit=1'],
  //   etc.
  // ]
  // Default: []
  preInitActions?: Array<[string, ...any[]]>,

  // A function to determine whether to track an interaction as a site search
  // instead of as a page view. If not a function, all interactions will be
  // tracked as page views. Receives the new route as an argument, and
  // returns either an object of keyword, category (optional) and resultsCount
  // (optional) to track as a site search, or a falsey value to track as a page
  // view.
  //
  // Example: (to) => {
  //   if (to.query.q && to.name === 'search') {
  //     return { keyword: to.query.q, category: to.params.category }
  //   } else {
  //    return null
  //   }
  // }
  // Default: undefined
  trackSiteSearch?: (( to: any ) => { keyword: string; category?: string; resultsCount?: number } | null),

  // Set this to include crossorigin attribute on the matomo script import
  // Default: undefined
  crossOrigin?: 'anonymous' | 'use-credentials',
}
````

### Accessing the Matomo Instance
#### Options API
If you're using the Options API, you can access the Matomo instance via `this.$matomo` or `this.$piwik`:

```vue
<script>
export default {
  methods: {
    trackClick() {
      this.$matomo.trackEvent('Button', 'Click', 'Submit');
    },
  },
};
</script>
```
#### Composition API
If you're using the Composition API, you can inject the Matomo instance using the `matomoKey` or, for better type support, use `useMatomo`:

```vue
<script setup>
import { inject } from 'vue';
import { matomoKey, useMatomo } from 'vue3-matomo';

const matomo = useMatomo(); // or: inject(matomoKey);

const trackClick = () => {
  matomo.value?.trackEvent('Button', 'Click', 'Submit');
};
</script>
```

### Listening for Events
You can listen for `matomo:loaded` and `matomo:failed` events in components and composables:

```ts
// useMatomoEvents.ts
import { matomoEvents } from 'vue3-matomo';

export function useMatomoEvents() {
  const onLoad = () => {
    matomoEvents.on('matomo:loaded', () => {
      console.log('Matomo loaded from composable');
    });
  }
  const onFail = () => {
    matomoEvents.on('matomo:failed', () => {
      console.error('Matomo failed from composable');
    });
  }

  export { onLoad, onFail }
}
```

#### Note on external link tracking

When using the option to `trackExternalLinks`, `vue3-matomo` ensures the corresponding Matomo method is called after each navigation event. Matomo scans the entire DOM for external links and adds its link handling. This means that if your external links are rendered dynamically these links may not be picked up. You need to call this method manually if links might not exist after the page has finished rendering (for example if the links come from some REST call). For more information refer to https://developer.matomo.org/guides/spa-tracking#link-tracking

```ts
this.$matomo?.enableLinkTracking()
// Or...
matomo.value?.enableLinkTracking()
// Or...
window._paq.push(['enableLinkTracking'])
```

### Ignoring routes

It is possible to ignore routes using the route meta:

```js
{
  path: '/page-2',
  name: 'Page2',
  component: Page2,
  meta: {
    analyticsIgnore: true
  }
}
```

### Managing tracking consent

Load the plugin with the `requireConsent` option enabled:

```ts
import { createVueMatomo } from "./index";

Vue.use(createVueMatomo({
  // ...
  requireConsent: true
}));
```

Matomo has a built in way to give and remember consent. The simplest way is to simply use the `rememberConsentGiven` provided by Matomo:

```vue
<template>
  <button @click="handleConsent()">Accept Tracking</button>
</template>

<script setup lang="ts">
  import { useMatomo } from 'vue3-matomo';

  const matomo = useMatomo();

  function handleConsent() {
    matomo.value?.rememberConsentGiven()
  }
</script>
```
If you prefer to manage consent yourself, call `setConsentGiven` instead on each page load after you establish that the user has given consent.


### Managing cookie consent

You can use Matomo Analytics without consent and cookie banner. For more information see [matomo faq: "How do I use matomo analytics without consent or cookie banner?](https://matomo.org/faq/new-to-piwik/how-do-i-use-matomo-analytics-without-consent-or-cookie-banner/).

Load the plugin with the `requireCookieConsent` option enabled:

```ts
import { createVueMatomo } from "./index";

Vue.use(createVueMatomo({
  // ...
  requireCookieConsent: true
}));
```

Matomo has a built in way to give and remember consent. The simplest way is to simply use the `rememberCookieConsentGiven` provided by Matomo:

```vue
<template>
  <button @click="handleConsent()">Accept Tracking</button>
</template>

<script setup lang="ts">
  import { useMatomo } from 'vue3-matomo';

  const matomo = useMatomo();

  function handleConsent() {
    matomo.value?.rememberCookieConsentGiven()
  }
</script>
```

If you prefer to manage consent yourself, call `setCookieConsentGiven` instead on each page load after you establish that the user has given consent.


## License
MIT License. See LICENSE for details.

## Credits
Forked from [vue-matomo](https://github.com/AmazingDreams/vue-matomo) by Dennis Ruhe.
