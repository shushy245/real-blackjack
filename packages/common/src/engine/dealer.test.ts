import { beforeEach, describe, it } from 'vitest';

import { makeDealerDriver } from './dealer.driver';

describe('shouldDealerHit', () => {
    let driver: ReturnType<typeof makeDealerDriver>;
    beforeEach(() => {
        driver = makeDealerDriver();
    });

    it('returns true for hard 16 (must hit)', () => {
        driver.assert.shouldHit({ value: 16, isSoft: false });
    });

    it('returns true for soft 17 (must hit — hits soft 17 rule)', () => {
        driver.assert.shouldHit({ value: 17, isSoft: true });
    });

    it('returns false for hard 17 (stand)', () => {
        driver.assert.shouldNotHit({ value: 17, isSoft: false });
    });

    it('returns false for soft 18 (stand)', () => {
        driver.assert.shouldNotHit({ value: 18, isSoft: true });
    });

    it('returns false for hard 21 (stand)', () => {
        driver.assert.shouldNotHit({ value: 21, isSoft: false });
    });

    it('returns false when already bust (no further hits)', () => {
        driver.assert.shouldNotHit({ value: 22, isSoft: false });
    });
});
