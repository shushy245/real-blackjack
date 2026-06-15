import { describe, expect, it } from 'vitest';

import { shouldDealerHit } from './dealer';

describe('shouldDealerHit', () => {
    it('returns true for hard 16 (must hit)', () => {
        expect(shouldDealerHit({ value: 16, isSoft: false })).toBe(true);
    });

    it('returns true for soft 17 (must hit — hits soft 17 rule)', () => {
        expect(shouldDealerHit({ value: 17, isSoft: true })).toBe(true);
    });

    it('returns false for hard 17 (stand)', () => {
        expect(shouldDealerHit({ value: 17, isSoft: false })).toBe(false);
    });

    it('returns false for soft 18 (stand)', () => {
        expect(shouldDealerHit({ value: 18, isSoft: true })).toBe(false);
    });

    it('returns false for hard 21 (stand)', () => {
        expect(shouldDealerHit({ value: 21, isSoft: false })).toBe(false);
    });

    it('returns false when already bust (no further hits)', () => {
        expect(shouldDealerHit({ value: 22, isSoft: false })).toBe(false);
    });
});
