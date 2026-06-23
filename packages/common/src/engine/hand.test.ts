import { describe, expect, it } from 'vitest';

import { Hand } from './hand';
import { Rank } from './types';
import { aCard } from '../testkit/builders';

describe('Hand.value', () => {
    it('single Two → { value: 2, isSoft: false }', () => {
        expect(Hand.of([aCard({ rank: Rank.Two }).build()]).value()).toEqual({ value: 2, isSoft: false });
    });

    it('single Seven → { value: 7, isSoft: false }', () => {
        expect(Hand.of([aCard({ rank: Rank.Seven }).build()]).value()).toEqual({ value: 7, isSoft: false });
    });

    it('Jack, Queen, King count as 10', () => {
        expect(Hand.of([aCard({ rank: Rank.Jack }).build()]).value()).toEqual({ value: 10, isSoft: false });
        expect(Hand.of([aCard({ rank: Rank.Queen }).build()]).value()).toEqual({ value: 10, isSoft: false });
        expect(Hand.of([aCard({ rank: Rank.King }).build()]).value()).toEqual({ value: 10, isSoft: false });
    });

    it('Ace + 6 → { value: 17, isSoft: true }', () => {
        expect(Hand.of([aCard({ rank: Rank.Ace }).build(), aCard({ rank: Rank.Six }).build()]).value()).toEqual({
            value: 17,
            isSoft: true,
        });
    });

    it('Ace + King → { value: 21, isSoft: true }', () => {
        expect(Hand.of([aCard({ rank: Rank.Ace }).build(), aCard({ rank: Rank.King }).build()]).value()).toEqual({
            value: 21,
            isSoft: true,
        });
    });

    it('Ace + King + Five → { value: 16, isSoft: false } (Ace demoted to 1)', () => {
        expect(
            Hand.of([
                aCard({ rank: Rank.Ace }).build(),
                aCard({ rank: Rank.King }).build(),
                aCard({ rank: Rank.Five }).build(),
            ]).value(),
        ).toEqual({ value: 16, isSoft: false });
    });

    it('Ace + Ace → { value: 12, isSoft: true }', () => {
        expect(Hand.of([aCard({ rank: Rank.Ace }).build(), aCard({ rank: Rank.Ace }).build()]).value()).toEqual({
            value: 12,
            isSoft: true,
        });
    });

    it('Ace + Ace + Nine → { value: 21, isSoft: true } (one Ace still at 11)', () => {
        expect(
            Hand.of([
                aCard({ rank: Rank.Ace }).build(),
                aCard({ rank: Rank.Ace }).build(),
                aCard({ rank: Rank.Nine }).build(),
            ]).value(),
        ).toEqual({ value: 21, isSoft: true });
    });
});

describe('Hand.isBust', () => {
    it('returns true when value exceeds 21', () => {
        expect(
            Hand.of([
                aCard({ rank: Rank.King }).build(),
                aCard({ rank: Rank.King }).build(),
                aCard({ rank: Rank.Two }).build(),
            ]).isBust(),
        ).toBe(true);
    });

    it('returns false at exactly 21', () => {
        expect(Hand.of([aCard({ rank: Rank.King }).build(), aCard({ rank: Rank.Ace }).build()]).isBust()).toBe(false);
    });
});

describe('Hand.isBlackjack', () => {
    it('returns true only for exactly 2 cards totalling 21 with one Ace', () => {
        expect(Hand.of([aCard({ rank: Rank.Ace }).build(), aCard({ rank: Rank.King }).build()]).isBlackjack()).toBe(
            true,
        );
        expect(Hand.of([aCard({ rank: Rank.Ace }).build(), aCard({ rank: Rank.Ten }).build()]).isBlackjack()).toBe(
            true,
        );
        expect(Hand.of([aCard({ rank: Rank.King }).build(), aCard({ rank: Rank.Ace }).build()]).isBlackjack()).toBe(
            true,
        );
    });

    it('returns false for 3-card 21', () => {
        expect(
            Hand.of([
                aCard({ rank: Rank.Ace }).build(),
                aCard({ rank: Rank.Nine }).build(),
                aCard({ rank: Rank.Ace }).build(),
            ]).isBlackjack(),
        ).toBe(false);
    });

    it('returns false for 2-card 20', () => {
        expect(Hand.of([aCard({ rank: Rank.King }).build(), aCard({ rank: Rank.Queen }).build()]).isBlackjack()).toBe(
            false,
        );
    });
});

describe('Hand.isPair', () => {
    it('returns true when both cards share the same rank', () => {
        expect(Hand.of([aCard({ rank: Rank.Eight }).build(), aCard({ rank: Rank.Eight }).build()]).isPair()).toBe(true);
    });

    it('returns false when cards differ in rank', () => {
        expect(Hand.of([aCard({ rank: Rank.Seven }).build(), aCard({ rank: Rank.Nine }).build()]).isPair()).toBe(false);
    });

    it('returns false for 3-card hand', () => {
        expect(
            Hand.of([
                aCard({ rank: Rank.Eight }).build(),
                aCard({ rank: Rank.Eight }).build(),
                aCard({ rank: Rank.Eight }).build(),
            ]).isPair(),
        ).toBe(false);
    });
});

describe('Hand.add', () => {
    it('returns a new Hand with the card appended', () => {
        const original = Hand.of([aCard({ rank: Rank.Seven }).build()]);
        const extended = original.add(aCard({ rank: Rank.Nine }).build());

        expect(original.cards).toHaveLength(1);
        expect(extended.cards).toHaveLength(2);
        expect(extended.value()).toEqual({ value: 16, isSoft: false });
    });
});

describe('Hand.isFirstAction', () => {
    it('returns true for a 2-card hand', () => {
        expect(Hand.of([aCard({ rank: Rank.Seven }).build(), aCard({ rank: Rank.Nine }).build()]).isFirstAction()).toBe(
            true,
        );
    });

    it('returns false for a 1-card hand', () => {
        expect(Hand.of([aCard({ rank: Rank.Seven }).build()]).isFirstAction()).toBe(false);
    });

    it('returns false for a 3-card hand', () => {
        expect(
            Hand.of([
                aCard({ rank: Rank.Seven }).build(),
                aCard({ rank: Rank.Three }).build(),
                aCard({ rank: Rank.Two }).build(),
            ]).isFirstAction(),
        ).toBe(false);
    });
});

describe('Hand.isUpCardAce', () => {
    it('returns true when first card is an Ace', () => {
        expect(Hand.of([aCard({ rank: Rank.Ace }).build(), aCard({ rank: Rank.Seven }).build()]).isUpCardAce()).toBe(
            true,
        );
    });

    it('returns false when first card is not an Ace', () => {
        expect(Hand.of([aCard({ rank: Rank.King }).build(), aCard({ rank: Rank.Ace }).build()]).isUpCardAce()).toBe(
            false,
        );
    });
});

describe('Hand.of', () => {
    it('throws when given an empty array', () => {
        expect(() => Hand.of([])).toThrow('Hand.of: cannot create an empty hand');
    });
});
