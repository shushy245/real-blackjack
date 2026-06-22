import { afterEach, describe, expect, it, vi } from 'vitest';

import { getRandomBytes } from './get-random-bytes';

describe('getRandomBytes', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('returns a Uint8Array of the requested length using crypto', () => {
        const result = getRandomBytes(16);
        expect(result).toBeInstanceOf(Uint8Array);
        expect(result).toHaveLength(16);
    });

    it('falls back to Math.random when globalThis.crypto is unavailable', () => {
        vi.stubGlobal('crypto', undefined);
        const result = getRandomBytes(16);
        expect(result).toBeInstanceOf(Uint8Array);
        expect(result).toHaveLength(16);
    });

    it('falls back to Math.random when getRandomValues is missing from crypto', () => {
        vi.stubGlobal('crypto', {});
        const result = getRandomBytes(16);
        expect(result).toBeInstanceOf(Uint8Array);
        expect(result).toHaveLength(16);
    });
});
