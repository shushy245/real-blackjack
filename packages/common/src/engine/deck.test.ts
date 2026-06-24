import { beforeEach, describe, it } from 'vitest';

import { createDeck } from './deck';
import { Rank, Suit } from './types';
import { makeDeckDriver } from './deck.driver';

describe('Rank', () => {
    let driver: ReturnType<typeof makeDeckDriver>;
    beforeEach(() => {
        driver = makeDeckDriver();
    });

    it('has exactly 13 values', () => {
        driver.assert.length(Object.values(Rank), 13);
    });
});

describe('Suit', () => {
    let driver: ReturnType<typeof makeDeckDriver>;
    beforeEach(() => {
        driver = makeDeckDriver();
    });

    it('has exactly 4 values', () => {
        driver.assert.length(Object.values(Suit), 4);
    });
});

describe('createDeck', () => {
    let driver: ReturnType<typeof makeDeckDriver>;
    beforeEach(() => {
        driver = makeDeckDriver();
    });

    it('returns exactly 52 cards', () => {
        driver.assert.length(createDeck(), 52);
    });

    it('contains no duplicate cards — every Rank × Suit exactly once', () => {
        driver.assert.uniqueCardCount(createDeck(), 52);
    });

    it('each card has a rank and a suit', () => {
        driver.assert.eachCardHasValidRankAndSuit(createDeck());
    });
});
