import { expect } from 'vitest';

import type { Shoe } from './shoe';
import type { Card } from './types';
import { needsReshuffle } from './shoe';

type ShoeDriver = {
    assert: {
        cardCount: (shoe: Shoe, expected: number) => void;
        dealtCount: (shoe: Shoe, expected: number) => void;
        needsReshuffle: (shoe: Shoe) => void;
        noReshuffle: (shoe: Shoe) => void;
        throws: (fn: () => unknown, message: string) => void;
        cardsEqual: (card1: Card, card2: Card) => void;
        cardsNotEqual: (card1: Card, card2: Card) => void;
        dealtCountLessThan: (shoe: Shoe, threshold: number) => void;
    };
};

export const makeShoeDriver = (): ShoeDriver => ({
    assert: {
        cardCount: (shoe, expected): void => {
            expect(shoe.cards).toHaveLength(expected);
        },
        dealtCount: (shoe, expected): void => {
            expect(shoe.dealtCount).toBe(expected);
        },
        needsReshuffle: (shoe): void => {
            expect(needsReshuffle(shoe)).toBe(true);
        },
        noReshuffle: (shoe): void => {
            expect(needsReshuffle(shoe)).toBe(false);
        },
        throws: (fn, message): void => {
            expect(fn).toThrow(message);
        },
        cardsEqual: (card1, card2): void => {
            expect(card1).toEqual(card2);
        },
        cardsNotEqual: (card1, card2): void => {
            expect(card1).not.toEqual(card2);
        },
        dealtCountLessThan: (shoe, threshold): void => {
            expect(shoe.dealtCount).toBeLessThan(threshold);
        },
    },
});
