import { expect } from 'vitest';

import type { Card } from './types';
import { Rank, Suit } from './types';

type DeckDriver = {
    assert: {
        length: (collection: unknown[], expected: number) => void;
        uniqueCardCount: (deck: Card[], expected: number) => void;
        eachCardHasValidRankAndSuit: (deck: Card[]) => void;
    };
};

export const makeDeckDriver = (): DeckDriver => ({
    assert: {
        length: (collection, expected): void => {
            expect(collection).toHaveLength(expected);
        },
        uniqueCardCount: (deck, expected): void => {
            const keys = deck.map((c) => `${c.rank}-${c.suit}`);
            const unique = new Set(keys);
            expect(unique.size).toBe(expected);
        },
        eachCardHasValidRankAndSuit: (deck): void => {
            const allRanks = Object.values(Rank);
            const allSuits = Object.values(Suit);
            for (const card of deck) {
                expect(allRanks).toContain(card.rank);
                expect(allSuits).toContain(card.suit);
            }
        },
    },
});
