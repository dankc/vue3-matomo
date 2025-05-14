// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { defaultOptions, isClient, matomoEvents, createScript } from '@/utils';

describe('Utils suite client-side', () => {
  it('isClient returns true when client-side', () => {
    const isClientCheck = isClient();
    expect(isClientCheck).toBe(true);
  });

  describe('matomoEvents emits events', () => {
    it('Emits matomo:failed', ({ expect }) => {
      matomoEvents.on('matomo:failed', () => expect(true));
      matomoEvents.emit('matomo:failed');
    });
    it('Emits matomo:loaded', ({ expect }) => {
      matomoEvents.on('matomo:loaded', () => expect(true));
      matomoEvents.emit('matomo:loaded');
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
