import { beforeEach, describe, it } from 'vitest';

import { createDeck } from './deck';
import { createRng, shuffle } from './rng';
import { makeRngDriver } from './rng.driver';

describe('createRng', () => {
    let driver: ReturnType<typeof makeRngDriver>;
    beforeEach(() => {
        driver = makeRngDriver();
    });

    it('returns a function producing numbers in [0, 1)', () => {
        const rng = createRng(42);
        const values = Array.from({ length: 100 }, () => rng());
        driver.assert.allInRange(values, 0, 1);
    });

    it('two instances with the same seed produce identical sequences', () => {
        const rng1 = createRng(42);
        const rng2 = createRng(42);
        const seq1 = Array.from({ length: 20 }, () => rng1());
        const seq2 = Array.from({ length: 20 }, () => rng2());
        driver.assert.equal(seq1, seq2);
    });

    it('different seeds produce different first values', () => {
        driver.assert.notEqual(createRng(42)(), createRng(99)());
    });
});

describe('shuffle', () => {
    let driver: ReturnType<typeof makeRngDriver>;
    beforeEach(() => {
        driver = makeRngDriver();
    });

    it('returns an array with the same 52 cards (no additions or removals)', () => {
        const deck = createDeck();
        const shuffled = shuffle(deck, createRng(42));
        driver.assert.length(shuffled, 52);
        driver.assert.sortedEqual(shuffled, deck);
    });

    it('same seed + same deck produces identical output', () => {
        const deck = createDeck();
        const shuffled1 = shuffle(deck, createRng(42));
        const shuffled2 = shuffle(deck, createRng(42));
        driver.assert.equal(shuffled1, shuffled2);
    });

    it('does not mutate the input array', () => {
        const deck = createDeck();
        const original = [...deck];
        shuffle(deck, createRng(42));
        driver.assert.equal(deck, original);
    });
});
