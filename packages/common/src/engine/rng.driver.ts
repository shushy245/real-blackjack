import { expect } from 'vitest';

import type { Card } from './types';

type RngDriver = {
    assert: {
        allInRange: (values: number[], min: number, max: number) => void;
        equal: (a: unknown, b: unknown) => void;
        notEqual: (a: unknown, b: unknown) => void;
        length: (arr: unknown[], expected: number) => void;
        sortedEqual: (shuffled: Card[], original: Card[]) => void;
    };
};

export const makeRngDriver = (): RngDriver => ({
    assert: {
        allInRange: (values, min, max): void => {
            for (const v of values) {
                expect(v).toBeGreaterThanOrEqual(min);
                expect(v).toBeLessThan(max);
            }
        },
        equal: (a, b): void => {
            expect(a).toEqual(b);
        },
        notEqual: (a, b): void => {
            expect(a).not.toBe(b);
        },
        length: (arr, expected): void => {
            expect(arr).toHaveLength(expected);
        },
        sortedEqual: (shuffled, original): void => {
            const sort = (cards: Card[]) =>
                [...cards].sort((a, b) => `${a.rank}${a.suit}`.localeCompare(`${b.rank}${b.suit}`));
            expect(sort(shuffled)).toEqual(sort(original));
        },
    },
});
