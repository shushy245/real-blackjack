import { beforeEach, describe, it } from 'vitest';

import { createRng } from './rng';
import { makeShoeDriver } from './shoe.driver';
import { type Shoe, createShoe, dealCard, reshuffleShoe } from './shoe';

describe('createShoe', () => {
    let driver: ReturnType<typeof makeShoeDriver>;
    beforeEach(() => {
        driver = makeShoeDriver();
    });

    it('returns a shoe with 312 cards (6 × 52)', () => {
        driver.assert.cardCount(createShoe(createRng(42)), 312);
    });

    it('starts with dealtCount 0', () => {
        driver.assert.dealtCount(createShoe(createRng(42)), 0);
    });
});

describe('dealCard', () => {
    let driver: ReturnType<typeof makeShoeDriver>;
    beforeEach(() => {
        driver = makeShoeDriver();
    });

    it('returns [card, newShoe] — original shoe unchanged', () => {
        const shoe = createShoe(createRng(42));
        const before = shoe.cards.length;
        const [, newShoe] = dealCard(shoe);
        driver.assert.cardCount(shoe, before);
        driver.assert.cardCount(newShoe, before - 1);
    });

    it('increments dealtCount by 1', () => {
        const shoe = createShoe(createRng(42));
        const [, newShoe] = dealCard(shoe);
        driver.assert.dealtCount(newShoe, 1);
    });

    it('two consecutive dealCard calls return different cards', () => {
        const shoe = createShoe(createRng(42));
        const [card1, shoe2] = dealCard(shoe);
        const [card2] = dealCard(shoe2);
        driver.assert.cardsNotEqual(card1, card2);
    });

    it('throws with descriptive message when shoe is empty', () => {
        const emptyShoe: Shoe = { cards: [], dealtCount: 312 };
        driver.assert.throws(() => dealCard(emptyShoe), 'dealCard: shoe is empty');
    });
});

describe('needsReshuffle', () => {
    let driver: ReturnType<typeof makeShoeDriver>;
    beforeEach(() => {
        driver = makeShoeDriver();
    });

    it('returns false when dealtCount < 234', () => {
        const shoe = createShoe(createRng(42));
        driver.assert.noReshuffle({ ...shoe, dealtCount: 233 });
    });

    it('returns true when dealtCount equals threshold (234)', () => {
        const shoe = createShoe(createRng(42));
        driver.assert.needsReshuffle({ ...shoe, dealtCount: 234 });
    });

    it('returns true when dealtCount exceeds threshold', () => {
        const shoe = createShoe(createRng(42));
        driver.assert.needsReshuffle({ ...shoe, dealtCount: 311 });
    });
});

describe('reshuffleShoe', () => {
    let driver: ReturnType<typeof makeShoeDriver>;
    beforeEach(() => {
        driver = makeShoeDriver();
    });

    it('resets to 312 cards with dealtCount 0', () => {
        const shoe = createShoe(createRng(42));
        const [, dealt1] = dealCard(shoe);
        const [, dealt2] = dealCard(dealt1);
        const reshuffled = reshuffleShoe(dealt2, createRng(99));
        driver.assert.cardCount(reshuffled, 312);
        driver.assert.dealtCount(reshuffled, 0);
    });

    it('same rng seed → same deal sequence from fresh shoe', () => {
        const shoe1 = createShoe(createRng(42));
        const shoe2 = createShoe(createRng(42));
        const [card1] = dealCard(shoe1);
        const [card2] = dealCard(shoe2);
        driver.assert.cardsEqual(card1, card2);
    });
});
