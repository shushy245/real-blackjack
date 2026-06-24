import { beforeEach, describe, it } from 'vitest';

import { Hand } from './hand';
import { Rank } from './types';
import { makeHandDriver } from './hand.driver';
import { aCard, aHand } from '../testkit/builders';

describe('Hand.value', () => {
    let driver: ReturnType<typeof makeHandDriver>;
    beforeEach(() => {
        driver = makeHandDriver();
    });

    it('single Two → { value: 2, isSoft: false }', () => {
        driver.assert.value(aHand().withRanks([Rank.Two]).build(), { value: 2, isSoft: false });
    });

    it('single Seven → { value: 7, isSoft: false }', () => {
        driver.assert.value(aHand().withRanks([Rank.Seven]).build(), { value: 7, isSoft: false });
    });

    it('Jack counts as 10', () => {
        driver.assert.value(aHand().withRanks([Rank.Jack]).build(), { value: 10, isSoft: false });
    });

    it('Queen counts as 10', () => {
        driver.assert.value(aHand().withRanks([Rank.Queen]).build(), { value: 10, isSoft: false });
    });

    it('King counts as 10', () => {
        driver.assert.value(aHand().withRanks([Rank.King]).build(), { value: 10, isSoft: false });
    });

    it('Ace + 6 → { value: 17, isSoft: true }', () => {
        driver.assert.value(aHand().withRanks([Rank.Ace, Rank.Six]).build(), { value: 17, isSoft: true });
    });

    it('Ace + King → { value: 21, isSoft: true }', () => {
        driver.assert.value(aHand().withRanks([Rank.Ace, Rank.King]).build(), { value: 21, isSoft: true });
    });

    it('Ace + King + Five → { value: 16, isSoft: false } (Ace demoted to 1)', () => {
        driver.assert.value(aHand().withRanks([Rank.Ace, Rank.King, Rank.Five]).build(), { value: 16, isSoft: false });
    });

    it('Ace + Ace → { value: 12, isSoft: true }', () => {
        driver.assert.value(aHand().withRanks([Rank.Ace, Rank.Ace]).build(), { value: 12, isSoft: true });
    });

    it('Ace + Ace + Nine → { value: 21, isSoft: true } (one Ace still at 11)', () => {
        driver.assert.value(aHand().withRanks([Rank.Ace, Rank.Ace, Rank.Nine]).build(), { value: 21, isSoft: true });
    });
});

describe('Hand.isBust', () => {
    let driver: ReturnType<typeof makeHandDriver>;
    beforeEach(() => {
        driver = makeHandDriver();
    });

    it('returns true when value exceeds 21', () => {
        driver.assert.isBust(aHand().withRanks([Rank.King, Rank.King, Rank.Two]).build());
    });

    it('returns false at exactly 21', () => {
        driver.assert.isNotBust(aHand().withRanks([Rank.King, Rank.Ace]).build());
    });
});

describe('Hand.isBlackjack', () => {
    let driver: ReturnType<typeof makeHandDriver>;
    beforeEach(() => {
        driver = makeHandDriver();
    });

    it('returns true for Ace + King', () => {
        driver.assert.isBlackjack(aHand().withRanks([Rank.Ace, Rank.King]).build());
    });

    it('returns true for Ace + Ten', () => {
        driver.assert.isBlackjack(aHand().withRanks([Rank.Ace, Rank.Ten]).build());
    });

    it('returns true for King + Ace', () => {
        driver.assert.isBlackjack(aHand().withRanks([Rank.King, Rank.Ace]).build());
    });

    it('returns false for 3-card 21', () => {
        driver.assert.isNotBlackjack(aHand().withRanks([Rank.Ace, Rank.Nine, Rank.Ace]).build());
    });

    it('returns false for 2-card 20', () => {
        driver.assert.isNotBlackjack(aHand().withRanks([Rank.King, Rank.Queen]).build());
    });
});

describe('Hand.isPair', () => {
    let driver: ReturnType<typeof makeHandDriver>;
    beforeEach(() => {
        driver = makeHandDriver();
    });

    it('returns true when both cards share the same rank', () => {
        driver.assert.isPair(aHand().withRanks([Rank.Eight, Rank.Eight]).build());
    });

    it('returns false when cards differ in rank', () => {
        driver.assert.isNotPair(aHand().withRanks([Rank.Seven, Rank.Nine]).build());
    });

    it('returns false for 3-card hand', () => {
        driver.assert.isNotPair(aHand().withRanks([Rank.Eight, Rank.Eight, Rank.Eight]).build());
    });
});

describe('Hand.add', () => {
    let driver: ReturnType<typeof makeHandDriver>;
    beforeEach(() => {
        driver = makeHandDriver();
    });

    it('returns a new Hand with the card appended', () => {
        const original = aHand().withRanks([Rank.Seven]).build();
        const extended = original.add(aCard().withRank(Rank.Nine).build());
        driver.assert.cardCount(original, 1);
        driver.assert.cardCount(extended, 2);
        driver.assert.value(extended, { value: 16, isSoft: false });
    });
});

describe('Hand.isFirstAction', () => {
    let driver: ReturnType<typeof makeHandDriver>;
    beforeEach(() => {
        driver = makeHandDriver();
    });

    it('returns true for a 2-card hand', () => {
        driver.assert.isFirstAction(aHand().withRanks([Rank.Seven, Rank.Nine]).build());
    });

    it('returns false for a 1-card hand', () => {
        driver.assert.isNotFirstAction(aHand().withRanks([Rank.Seven]).build());
    });

    it('returns false for a 3-card hand', () => {
        driver.assert.isNotFirstAction(aHand().withRanks([Rank.Seven, Rank.Three, Rank.Two]).build());
    });
});

describe('Hand.isUpCardAce', () => {
    let driver: ReturnType<typeof makeHandDriver>;
    beforeEach(() => {
        driver = makeHandDriver();
    });

    it('returns true when first card is an Ace', () => {
        driver.assert.isUpCardAce(aHand().withRanks([Rank.Ace, Rank.Seven]).build());
    });

    it('returns false when first card is not an Ace', () => {
        driver.assert.isNotUpCardAce(aHand().withRanks([Rank.King, Rank.Ace]).build());
    });
});

describe('Hand.of', () => {
    let driver: ReturnType<typeof makeHandDriver>;
    beforeEach(() => {
        driver = makeHandDriver();
    });

    it('throws when given an empty array', () => {
        driver.assert.throws(() => Hand.of([]), 'Hand.of: cannot create an empty hand');
    });
});
