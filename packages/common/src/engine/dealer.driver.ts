import { expect } from 'vitest';

import { shouldDealerHit } from './dealer';

type DealerDriver = {
    assert: {
        shouldHit: (params: { value: number; isSoft: boolean }) => void;
        shouldNotHit: (params: { value: number; isSoft: boolean }) => void;
    };
};

export const makeDealerDriver = (): DealerDriver => ({
    assert: {
        shouldHit: (params): void => {
            expect(shouldDealerHit(params)).toBe(true);
        },
        shouldNotHit: (params): void => {
            expect(shouldDealerHit(params)).toBe(false);
        },
    },
});
