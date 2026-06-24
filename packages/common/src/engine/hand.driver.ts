import { expect } from 'vitest';

import type { Hand, HandValue } from './hand';

type HandDriver = {
    assert: {
        value: (hand: Hand, expected: HandValue) => void;
        isBust: (hand: Hand) => void;
        isNotBust: (hand: Hand) => void;
        isBlackjack: (hand: Hand) => void;
        isNotBlackjack: (hand: Hand) => void;
        isPair: (hand: Hand) => void;
        isNotPair: (hand: Hand) => void;
        isFirstAction: (hand: Hand) => void;
        isNotFirstAction: (hand: Hand) => void;
        isUpCardAce: (hand: Hand) => void;
        isNotUpCardAce: (hand: Hand) => void;
        cardCount: (hand: Hand, count: number) => void;
        throws: (fn: () => unknown, message: string) => void;
    };
};

export const makeHandDriver = (): HandDriver => ({
    assert: {
        value: (hand, expected): void => {
            expect(hand.value()).toEqual(expected);
        },
        isBust: (hand): void => {
            expect(hand.isBust()).toBe(true);
        },
        isNotBust: (hand): void => {
            expect(hand.isBust()).toBe(false);
        },
        isBlackjack: (hand): void => {
            expect(hand.isBlackjack()).toBe(true);
        },
        isNotBlackjack: (hand): void => {
            expect(hand.isBlackjack()).toBe(false);
        },
        isPair: (hand): void => {
            expect(hand.isPair()).toBe(true);
        },
        isNotPair: (hand): void => {
            expect(hand.isPair()).toBe(false);
        },
        isFirstAction: (hand): void => {
            expect(hand.isFirstAction()).toBe(true);
        },
        isNotFirstAction: (hand): void => {
            expect(hand.isFirstAction()).toBe(false);
        },
        isUpCardAce: (hand): void => {
            expect(hand.isUpCardAce()).toBe(true);
        },
        isNotUpCardAce: (hand): void => {
            expect(hand.isUpCardAce()).toBe(false);
        },
        cardCount: (hand, count): void => {
            expect(hand.cards).toHaveLength(count);
        },
        throws: (fn, message): void => {
            expect(fn).toThrow(message);
        },
    },
});
