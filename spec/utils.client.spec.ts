// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { defaultOptions, isClient, matomoEvents, createScript } from '@/utils';

describe('Utils suite client-side', () => {
  it('isClient returns true when client-side', () => {
    const isClientCheck = isClient();
    expect(isClientCheck).toBe(true);
  });

  describe('matomoEvents emits events', () => {
    const dummyFunction = vi.fn(() => 0);
    it('Emits matomo:failed', () => {
      matomoEvents.on('matomo:failed', () => dummyFunction());
      matomoEvents.emit('matomo:failed');
      expect(dummyFunction).toHaveBeenCalled();
      dummyFunction.mockReset();
    });
    it('Emits matomo:loaded', () => {
      matomoEvents.on('matomo:loaded', () => dummyFunction());
      matomoEvents.emit('matomo:loaded');
      expect(dummyFunction).toHaveBeenCalled();
      dummyFunction.mockReset();
    });
  });

  describe('createScript', () => {
    const dummyHost = 'https://example.com/analytics/';
    const { async, crossOrigin } = defaultOptions;

    it('Creates a script element with defaults', () => {
      const script = createScript(dummyHost, { async, crossOrigin });
      expect(script.nodeName).toBe('SCRIPT');
      expect(script.async).toBe(async);
      expect(script.crossOrigin).toBe('');
    });

    it('Creates an async script element', () => {
      const script = createScript(dummyHost, { async: true, crossOrigin });
      expect(script.nodeName).toBe('SCRIPT');
      expect(script.async).toBe(true);
      expect(script.crossOrigin).toBe('');
    });

    it('Creates a script element with anonymous crossOrigin', () => {
      const script = createScript(dummyHost, { async, crossOrigin: 'anonymous' });
      expect(script.nodeName).toBe('SCRIPT');
      expect(script.async).toBe(async);
      expect(script.crossOrigin).toBe('anonymous');
    });

    it('Creates a script element with use-credentials crossOrigin', () => {
      const script = createScript(dummyHost, { async, crossOrigin: 'use-credentials' });
      expect(script.nodeName).toBe('SCRIPT');
      expect(script.async).toBe(async);
      expect(script.crossOrigin).toBe('use-credentials');
    });
  });
});
