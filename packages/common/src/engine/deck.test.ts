import { describe, expect, it } from 'vitest';

import { createDeck } from './deck';
import { Rank, Suit } from './types';

describe('Rank', () => {
    it('has exactly 13 values', () => {
        expect(Object.values(Rank).length).toBe(13);
    });
});

describe('Suit', () => {
    it('has exactly 4 values', () => {
        expect(Object.values(Suit).length).toBe(4);
    });
});

describe('createDeck', () => {
    it('returns exactly 52 cards', () => {
        expect(createDeck()).toHaveLength(52);
    });

    it('contains no duplicate cards — every Rank × Suit exactly once', () => {
        const deck = createDeck();
        const keys = deck.map((c) => `${c.rank}-${c.suit}`);
        const unique = new Set(keys);

        expect(unique.size).toBe(52);
    });

    it('each card has a rank and a suit', () => {
        const deck = createDeck();
        const allRanks = Object.values(Rank);
        const allSuits = Object.values(Suit);

        for (const card of deck) {
            expect(allRanks).toContain(card.rank);
            expect(allSuits).toContain(card.suit);
        }
    });
});
