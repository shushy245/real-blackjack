import { describe, expect, it } from 'vitest';

import type { Card } from './types';
import { Rank, Suit } from './types';
import { calculateHand, isBust, isBlackjack } from './hand';

const card = (rank: Rank, suit = Suit.Spades): Card => ({ rank, suit });

describe('calculateHand', () => {
    it('empty hand → { value: 0, isSoft: false }', () => {
        expect(calculateHand([])).toEqual({ value: 0, isSoft: false });
    });

    it('Two through Ten count at face value', () => {
        expect(calculateHand([card(Rank.Two)])).toEqual({ value: 2, isSoft: false });
        expect(calculateHand([card(Rank.Seven)])).toEqual({ value: 7, isSoft: false });
        expect(calculateHand([card(Rank.Ten)])).toEqual({ value: 10, isSoft: false });
    });

    it('Jack, Queen, King count as 10', () => {
        expect(calculateHand([card(Rank.Jack)])).toEqual({ value: 10, isSoft: false });
        expect(calculateHand([card(Rank.Queen)])).toEqual({ value: 10, isSoft: false });
        expect(calculateHand([card(Rank.King)])).toEqual({ value: 10, isSoft: false });
    });

    it('Ace + 6 → { value: 17, isSoft: true }', () => {
        expect(calculateHand([card(Rank.Ace), card(Rank.Six)])).toEqual({ value: 17, isSoft: true });
    });

    it('Ace + King → { value: 21, isSoft: true }', () => {
        expect(calculateHand([card(Rank.Ace), card(Rank.King)])).toEqual({ value: 21, isSoft: true });
    });

    it('Ace + King + Five → { value: 16, isSoft: false } (Ace demoted to 1)', () => {
        expect(calculateHand([card(Rank.Ace), card(Rank.King), card(Rank.Five)])).toEqual({
            value: 16,
            isSoft: false,
        });
    });

    it('Ace + Ace → { value: 12, isSoft: true }', () => {
        expect(calculateHand([card(Rank.Ace), card(Rank.Ace)])).toEqual({ value: 12, isSoft: true });
    });

    it('Ace + Ace + Nine → { value: 21, isSoft: true } (one Ace still at 11)', () => {
        expect(calculateHand([card(Rank.Ace), card(Rank.Ace), card(Rank.Nine)])).toEqual({
            value: 21,
            isSoft: true,
        });
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
        expect(isBlackjack([card(Rank.Ace), card(Rank.King)])).toBe(true);
        expect(isBlackjack([card(Rank.Ace), card(Rank.Ten)])).toBe(true);
    });

    it('returns false for 3-card 21', () => {
        expect(isBlackjack([card(Rank.Ace), card(Rank.Nine), card(Rank.Ace)])).toBe(false);
    });

    it('returns false for 2-card 20', () => {
        expect(isBlackjack([card(Rank.King), card(Rank.Queen)])).toBe(false);
    });
});
