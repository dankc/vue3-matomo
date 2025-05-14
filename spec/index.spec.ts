// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useInjectedSetup } from './utils/test-app.ts';
import { createVueMatomo, useMatomo, type MatomoInstance } from '@/index';
import { isClient } from '@/utils';

vi.mock('@/utils.ts', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/utils.ts')>();
  return {
    ...mod,
    isClient: vi.fn().mockReturnValue(true),
    loadScript: vi.fn().mockImplementation(() => Promise.resolve()),
  };
});

const options = { host: 'https://example.com/matomo.php', siteId: 1, trackerFileName: 'matomo' };

describe('Client-side plugin functionality', () => {
  beforeEach(() => {
    window.Piwik = {
      getAsyncTracker: vi.fn().mockReturnValue({
        trackPageView: vi.fn(),
        trackSiteSearch: vi.fn(),
        setTrackerUrl: vi.fn(),
        setSiteId: vi.fn(),
      } as Partial<MatomoInstance>),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('Successfully installs vue3-matomo plugin', async () => {
    const plugin = () => createVueMatomo(options);

    const { app, composableResult, unmount } = await useInjectedSetup(useMatomo, plugin);

    // Verify properties for Options API
    expect(app.config.globalProperties.$matomo).toBeDefined();
    expect(app.config.globalProperties.$matomo.trackPageView).toBeDefined();
    expect(app.config.globalProperties.$piwik).toBe(app.config.globalProperties.$matomo);

    // Verify useMatomo for Composition API
    expect(composableResult).toBeDefined();
    expect(composableResult.value).toBeDefined();
    expect(composableResult.value?.trackPageView).toBeDefined();

    unmount();
  });
});

describe('SSR plugin functionality', () => {
  it('Early returns during install when server-side', async () => {
    vi.mocked(isClient).mockReturnValue(false);

    const plugin = () => createVueMatomo(options);
    const { app, composableResult, unmount } = await useInjectedSetup(useMatomo, plugin);

    // Verify properties for Options API don't exist
    expect(app.config.globalProperties.$matomo).toBeUndefined();
    expect(app.config.globalProperties.$piwik).toBeUndefined();

    // Verify useMatomo returns an undefined ref for Composition API
    expect(composableResult).toBeDefined();
    expect(composableResult.value).toBeUndefined();

    unmount();
  });
});
