import { describe, expect, it } from 'vitest';

import { createRng } from './rng';
import { type Shoe, createShoe, dealCard, needsReshuffle, reshuffleShoe } from './shoe';

describe('createShoe', () => {
    it('returns a shoe with 312 cards (6 × 52)', () => {
        expect(createShoe(createRng(42)).cards).toHaveLength(312);
    });

    it('starts with dealtCount 0', () => {
        expect(createShoe(createRng(42)).dealtCount).toBe(0);
    });
});

describe('dealCard', () => {
    it('returns [card, newShoe] — original shoe unchanged', () => {
        const shoe = createShoe(createRng(42));
        const before = shoe.cards.length;
        const [, newShoe] = dealCard(shoe);

        expect(shoe.cards).toHaveLength(before);
        expect(newShoe.cards).toHaveLength(before - 1);
    });

    it('increments dealtCount by 1', () => {
        const shoe = createShoe(createRng(42));
        const [, newShoe] = dealCard(shoe);

        expect(newShoe.dealtCount).toBe(1);
    });

    it('two consecutive dealCard calls return different cards', () => {
        const shoe = createShoe(createRng(42));
        const [card1, shoe2] = dealCard(shoe);
        const [card2] = dealCard(shoe2);

        expect(card1).not.toEqual(card2);
    });

    it('throws with descriptive message when shoe is empty', () => {
        const emptyShoe: Shoe = { cards: [], dealtCount: 312 };

        expect(() => dealCard(emptyShoe)).toThrow('dealCard: shoe is empty');
    });
});

describe('needsReshuffle', () => {
    it('returns false when dealtCount < 234', () => {
        const shoe = createShoe(createRng(42));

        expect(needsReshuffle({ ...shoe, dealtCount: 233 })).toBe(false);
    });

    it('returns true when dealtCount >= 234', () => {
        const shoe = createShoe(createRng(42));

        expect(needsReshuffle({ ...shoe, dealtCount: 234 })).toBe(true);
        expect(needsReshuffle({ ...shoe, dealtCount: 311 })).toBe(true);
    });
});

describe('reshuffleShoe', () => {
    it('resets to 312 cards with dealtCount 0', () => {
        const shoe = createShoe(createRng(42));
        const [, dealt1] = dealCard(shoe);
        const [, dealt2] = dealCard(dealt1);
        const reshuffled = reshuffleShoe(dealt2, createRng(99));

        expect(reshuffled.cards).toHaveLength(312);
        expect(reshuffled.dealtCount).toBe(0);
    });

    it('same rng seed → same deal sequence from fresh shoe', () => {
        const shoe1 = createShoe(createRng(42));
        const shoe2 = createShoe(createRng(42));
        const [card1] = dealCard(shoe1);
        const [card2] = dealCard(shoe2);

        expect(card1).toEqual(card2);
    });
});
