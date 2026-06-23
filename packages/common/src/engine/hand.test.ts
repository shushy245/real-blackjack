import { describe, expect, it } from 'vitest';

import { Rank } from './types';
import { aCard } from '../testkit/builders';
import { calculateHand, isBlackjack, isBust } from './hand';

describe('calculateHand', () => {
    it('empty hand → { value: 0, isSoft: false }', () => {
        expect(calculateHand([])).toEqual({ value: 0, isSoft: false });
    });

    it('Two through Ten count at face value', () => {
        expect(calculateHand([aCard({ rank: Rank.Two }).build()])).toEqual({ value: 2, isSoft: false });
        expect(calculateHand([aCard({ rank: Rank.Seven }).build()])).toEqual({ value: 7, isSoft: false });
        expect(calculateHand([aCard({ rank: Rank.Ten }).build()])).toEqual({ value: 10, isSoft: false });
    });

    it('Jack, Queen, King count as 10', () => {
        expect(calculateHand([aCard({ rank: Rank.Jack }).build()])).toEqual({ value: 10, isSoft: false });
        expect(calculateHand([aCard({ rank: Rank.Queen }).build()])).toEqual({ value: 10, isSoft: false });
        expect(calculateHand([aCard({ rank: Rank.King }).build()])).toEqual({ value: 10, isSoft: false });
    });

    it('Ace + 6 → { value: 17, isSoft: true }', () => {
        expect(calculateHand([aCard({ rank: Rank.Ace }).build(), aCard({ rank: Rank.Six }).build()])).toEqual({
            value: 17,
            isSoft: true,
        });
    });

    it('Ace + King → { value: 21, isSoft: true }', () => {
        expect(calculateHand([aCard({ rank: Rank.Ace }).build(), aCard({ rank: Rank.King }).build()])).toEqual({
            value: 21,
            isSoft: true,
        });
    });

    it('Ace + King + Five → { value: 16, isSoft: false } (Ace demoted to 1)', () => {
        expect(
            calculateHand([
                aCard({ rank: Rank.Ace }).build(),
                aCard({ rank: Rank.King }).build(),
                aCard({ rank: Rank.Five }).build(),
            ]),
        ).toEqual({ value: 16, isSoft: false });
    });

    it('Ace + Ace → { value: 12, isSoft: true }', () => {
        expect(calculateHand([aCard({ rank: Rank.Ace }).build(), aCard({ rank: Rank.Ace }).build()])).toEqual({
            value: 12,
            isSoft: true,
        });
    });

    it('Ace + Ace + Nine → { value: 21, isSoft: true } (one Ace still at 11)', () => {
        expect(
            calculateHand([
                aCard({ rank: Rank.Ace }).build(),
                aCard({ rank: Rank.Ace }).build(),
                aCard({ rank: Rank.Nine }).build(),
            ]),
        ).toEqual({ value: 21, isSoft: true });
    });
});

describe('isBust', () => {
    it('returns true when value > 21', () => {
        expect(isBust({ value: 22, isSoft: false })).toBe(true);
        expect(isBust({ value: 21, isSoft: false })).toBe(false);
    });
});

describe('isBlackjack', () => {
    it('returns true only for exactly 2 cards totalling 21 with one Ace', () => {
        expect(isBlackjack([aCard({ rank: Rank.Ace }).build(), aCard({ rank: Rank.King }).build()])).toBe(true);
        expect(isBlackjack([aCard({ rank: Rank.Ace }).build(), aCard({ rank: Rank.Ten }).build()])).toBe(true);
    });

    it('returns false for 3-card 21', () => {
        expect(
            isBlackjack([
                aCard({ rank: Rank.Ace }).build(),
                aCard({ rank: Rank.Nine }).build(),
                aCard({ rank: Rank.Ace }).build(),
            ]),
        ).toBe(false);
    });

    it('returns false for 2-card 20', () => {
        expect(isBlackjack([aCard({ rank: Rank.King }).build(), aCard({ rank: Rank.Queen }).build()])).toBe(false);
    });
});
