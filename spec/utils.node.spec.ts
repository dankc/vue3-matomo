import { describe, expect, it } from 'vitest';
import { isClient } from '@/utils';

describe('isClient in node', () => {
  it('isClient returns false when server-side', () => {
    const isClientCheck = isClient();
    expect(isClientCheck).toBe(false);
  });
});
