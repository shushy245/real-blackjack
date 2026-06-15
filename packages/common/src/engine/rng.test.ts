import { describe, expect, it } from 'vitest';

import { createDeck } from './deck';
import { createRng, shuffle } from './rng';

describe('createRng', () => {
    it('returns a function producing numbers in [0, 1)', () => {
        const rng = createRng(42);
        const values = Array.from({ length: 100 }, () => rng());

        for (const v of values) {
            expect(v).toBeGreaterThanOrEqual(0);
            expect(v).toBeLessThan(1);
        }
    });

    it('two instances with the same seed produce identical sequences', () => {
        const rng1 = createRng(42);
        const rng2 = createRng(42);
        const seq1 = Array.from({ length: 20 }, () => rng1());
        const seq2 = Array.from({ length: 20 }, () => rng2());

        expect(seq1).toEqual(seq2);
    });

    it('different seeds produce different first values', () => {
        expect(createRng(42)()).not.toBe(createRng(99)());
    });
});

describe('shuffle', () => {
    it('returns an array with the same 52 cards (no additions or removals)', () => {
        const deck = createDeck();
        const rng = createRng(42);
        const shuffled = shuffle(deck, rng);

        expect(shuffled).toHaveLength(52);
        expect([...shuffled].sort((a, b) => `${a.rank}${a.suit}`.localeCompare(`${b.rank}${b.suit}`))).toEqual(
            [...deck].sort((a, b) => `${a.rank}${a.suit}`.localeCompare(`${b.rank}${b.suit}`)),
        );
    });

    it('same seed + same deck produces identical output', () => {
        const deck = createDeck();
        const shuffled1 = shuffle(deck, createRng(42));
        const shuffled2 = shuffle(deck, createRng(42));

        expect(shuffled1).toEqual(shuffled2);
    });

    it('does not mutate the input array', () => {
        const deck = createDeck();
        const original = [...deck];
        shuffle(deck, createRng(42));

        expect(deck).toEqual(original);
    });
});
