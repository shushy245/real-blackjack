import { beforeEach, describe, it } from 'vitest';

import { createRng } from './rng';
import { createShoe } from './shoe';
import type { Card } from './types';
import { Move, Rank, Suit } from './types';
import { makeRoundDriver } from './round.driver';
import { applyRoundAction, createRound } from './round';
import { aCard, aHand, aShoe } from '../testkit/builders';

// first 4 cards: player gets 7,9 (hard 16); dealer gets 6 (up), K (hole) — no BJ, player-action
const actionRound = (extraCards: Card[], balance = 500, bet = 50) => {
    const shoe = aShoe([
        aCard().withRank(Rank.Seven).build(),
        aCard().withRank(Rank.Six).build(),
        aCard().withRank(Rank.Nine).build(),
        aCard().withRank(Rank.King).build(),
        ...extraCards,
    ]).build();

    return createRound(bet, balance, shoe);
};

describe('createRound — deal phase', () => {
    let driver: ReturnType<typeof makeRoundDriver>;
    beforeEach(() => {
        driver = makeRoundDriver();
    });

    it('player has 2 cards and dealer has 2 cards after deal', () => {
        const shoe = createShoe(createRng(42));
        const round = createRound(50, 500, shoe);
        driver.assert.playerCardCount(round, 0, 2);
        driver.assert.dealerCardCount(round, 2);
    });

    it('shoe has 4 fewer cards after deal', () => {
        const shoe = createShoe(createRng(42));
        const before = shoe.cards.length;
        const round = createRound(50, 500, shoe);
        driver.assert.shoeSize(round, before - 4);
    });

    it('hole card is not revealed after deal', () => {
        const shoe = createShoe(createRng(42));
        const round = createRound(50, 500, shoe);
        driver.assert.holeCardIsNotRevealed(round);
    });

    it('phase is player-action when neither player nor dealer has blackjack', () => {
        const shoe = aShoe([
            aCard().withRank(Rank.Seven).build(),
            aCard().withRank(Rank.Six).build(),
            aCard().withRank(Rank.Nine).build(),
            aCard().withRank(Rank.King).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        driver.assert.phase(round, 'player-action');
    });

    it('phase is settling when player has blackjack and dealer up card is not Ace or 10-value', () => {
        const shoe = aShoe([
            aCard().withRank(Rank.Ace).build(),
            aCard().withRank(Rank.Six).build(),
            aCard().withRank(Rank.King).build(),
            aCard().withRank(Rank.Nine).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        driver.assert.phase(round, 'settling');
    });

    it('hole card is revealed when player has blackjack and round goes directly to settling', () => {
        const shoe = aShoe([
            aCard().withRank(Rank.Ace).build(),
            aCard().withRank(Rank.Six).build(),
            aCard().withRank(Rank.King).build(),
            aCard().withRank(Rank.Nine).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        driver.assert.holeCardIsRevealed(round);
    });

    it('phase is insurance-pending when player has blackjack and dealer shows Ace', () => {
        const shoe = aShoe([
            aCard().withRank(Rank.Ace).withSuit(Suit.Spades).build(),
            aCard().withRank(Rank.Ace).withSuit(Suit.Hearts).build(),
            aCard().withRank(Rank.King).build(),
            aCard().withRank(Rank.Nine).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        driver.assert.phase(round, 'insurance-pending');
    });

    it('phase is settling when dealer has blackjack and up card is not Ace (peek reveals BJ)', () => {
        const shoe = aShoe([
            aCard().withRank(Rank.Seven).build(),
            aCard().withRank(Rank.King).build(),
            aCard().withRank(Rank.Nine).build(),
            aCard().withRank(Rank.Ace).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        driver.assert.phase(round, 'settling');
    });

    it('phase is insurance-pending when dealer shows Ace and has BJ in hole (insurance offered first)', () => {
        const shoe = aShoe([
            aCard().withRank(Rank.Seven).build(),
            aCard().withRank(Rank.Ace).build(),
            aCard().withRank(Rank.Nine).build(),
            aCard().withRank(Rank.King).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        driver.assert.phase(round, 'insurance-pending');
        driver.assert.holeCardIsNotRevealed(round);
    });
});

describe('applyRoundAction — Hit', () => {
    let driver: ReturnType<typeof makeRoundDriver>;
    beforeEach(() => {
        driver = makeRoundDriver();
    });

    it('adds a card to the active hand', () => {
        const round = actionRound([aCard().withRank(Rank.Three).build()]);
        const next = applyRoundAction(round, { type: Move.Hit });
        driver.assert.playerCardCount(next, 0, 3);
    });

    it('busting the only hand moves to dealer-turn', () => {
        const round = actionRound([aCard().withRank(Rank.King).build()]);
        const next = applyRoundAction(round, { type: Move.Hit });
        driver.assert.phase(next, 'dealer-turn');
    });

    it('reaching exactly 21 auto-stands and moves to dealer-turn (single hand)', () => {
        const round = actionRound([aCard().withRank(Rank.Five).build()]);
        const next = applyRoundAction(round, { type: Move.Hit });
        driver.assert.phase(next, 'dealer-turn');
    });

    it('non-bust hit on single hand stays in player-action', () => {
        const round = actionRound([aCard().withRank(Rank.Three).build()]);
        const next = applyRoundAction(round, { type: Move.Hit });
        driver.assert.phase(next, 'player-action');
    });
});

describe('applyRoundAction — Stand', () => {
    let driver: ReturnType<typeof makeRoundDriver>;
    beforeEach(() => {
        driver = makeRoundDriver();
    });

    it('advances to dealer-turn on single hand', () => {
        const round = actionRound([]);
        const next = applyRoundAction(round, { type: Move.Stand });
        driver.assert.phase(next, 'dealer-turn');
    });

    it('advances activeHandIndex when more hands remain', () => {
        const base = actionRound([aCard().withRank(Rank.Three).build()]);
        const firstHand = base.playerHands[0];
        if (firstHand === undefined) throw new Error('expected hand at index 0');
        const twoHand: typeof base = {
            ...base,
            playerHands: [firstHand, aHand().withRanks([Rank.Nine, Rank.Three]).build()],
            handBets: [50, 50],
            activeHandIndex: 0,
        };
        const next = applyRoundAction(twoHand, { type: Move.Stand });
        driver.assert.activeHandIndex(next, 1);
        driver.assert.phase(next, 'player-action');
    });
});

describe('applyRoundAction — Double', () => {
    let driver: ReturnType<typeof makeRoundDriver>;
    beforeEach(() => {
        driver = makeRoundDriver();
    });

    it('doubles activeBet and deducts from balance', () => {
        const round = actionRound([aCard().withRank(Rank.Three).build()]);
        const next = applyRoundAction(round, { type: Move.Double });
        driver.assert.activeBet(next, 100);
        driver.assert.balance(next, 450);
    });

    it('deals exactly one card then auto-stands', () => {
        const round = actionRound([aCard().withRank(Rank.Three).build()]);
        const next = applyRoundAction(round, { type: Move.Double });
        driver.assert.playerCardCount(next, 0, 3);
        driver.assert.phase(next, 'dealer-turn');
    });
});

describe('applyRoundAction — Split', () => {
    let driver: ReturnType<typeof makeRoundDriver>;
    beforeEach(() => {
        driver = makeRoundDriver();
    });

    it('creates two hands from a pair', () => {
        const shoe = aShoe([
            aCard().withRank(Rank.Eight).withSuit(Suit.Hearts).build(),
            aCard().withRank(Rank.Six).build(),
            aCard().withRank(Rank.Eight).withSuit(Suit.Spades).build(),
            aCard().withRank(Rank.King).build(),
            aCard().withRank(Rank.Three).build(),
            aCard().withRank(Rank.Four).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        const next = applyRoundAction(round, { type: Move.Split });
        driver.assert.handCount(next, 2);
        driver.assert.playerCardCount(next, 0, 2);
        driver.assert.playerCardCount(next, 1, 2);
        driver.assert.activeHandIndex(next, 0);
    });

    it('deducts originalBet from balance', () => {
        const shoe = aShoe([
            aCard().withRank(Rank.Eight).withSuit(Suit.Hearts).build(),
            aCard().withRank(Rank.Six).build(),
            aCard().withRank(Rank.Eight).withSuit(Suit.Spades).build(),
            aCard().withRank(Rank.King).build(),
            aCard().withRank(Rank.Three).build(),
            aCard().withRank(Rank.Four).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        const next = applyRoundAction(round, { type: Move.Split });
        driver.assert.balance(next, 450);
    });

    it('auto-advances past the new active hand when it immediately reaches 21 (e.g. A + King after splitting aces)', () => {
        const shoe = aShoe([
            aCard().withRank(Rank.Ace).withSuit(Suit.Spades).build(),
            aCard().withRank(Rank.Six).build(),
            aCard().withRank(Rank.Ace).withSuit(Suit.Hearts).build(),
            aCard().withRank(Rank.Three).build(),
            aCard().withRank(Rank.Ace).withSuit(Suit.Clubs).build(),
            aCard().withRank(Rank.Five).build(),
            aCard().withRank(Rank.King).build(),
            aCard().withRank(Rank.Seven).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        const afterSplit1 = applyRoundAction(round, { type: Move.Split });
        const afterSplit2 = applyRoundAction(afterSplit1, { type: Move.Split });
        driver.assert.handCount(afterSplit2, 3);
        driver.assert.phase(afterSplit2, 'player-action');
        driver.assert.activeHandIndex(afterSplit2, 1);
    });

    it('advances to dealer-turn when every split hand immediately reaches 21', () => {
        const shoe = aShoe([
            aCard().withRank(Rank.Ace).withSuit(Suit.Spades).build(),
            aCard().withRank(Rank.Six).build(),
            aCard().withRank(Rank.Ace).withSuit(Suit.Hearts).build(),
            aCard().withRank(Rank.Three).build(),
            aCard().withRank(Rank.King).build(),
            aCard().withRank(Rank.Queen).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        const afterSplit = applyRoundAction(round, { type: Move.Split });
        driver.assert.handCount(afterSplit, 2);
        driver.assert.phase(afterSplit, 'dealer-turn');
    });

    it('throws when attempting a 5th split', () => {
        const base = actionRound([]);
        const fourHands: typeof base = {
            ...base,
            playerHands: [
                aHand()
                    .withCards([
                        aCard().withRank(Rank.Eight).withSuit(Suit.Hearts).build(),
                        aCard().withRank(Rank.Eight).withSuit(Suit.Spades).build(),
                    ])
                    .build(),
                aHand().withRanks([Rank.Eight, Rank.Three]).build(),
                aHand().withRanks([Rank.Eight, Rank.Five]).build(),
                aHand().withRanks([Rank.Two, Rank.Four]).build(),
            ],
            handBets: [50, 50, 50, 50],
        };
        driver.assert.throws(() => applyRoundAction(fourHands, { type: Move.Split }));
    });
});

describe('applyRoundAction — Insurance', () => {
    let driver: ReturnType<typeof makeRoundDriver>;
    beforeEach(() => {
        driver = makeRoundDriver();
    });

    it('accepted: deducts half bet from balance, sets insuranceBet, marks taken, moves to player-action', () => {
        const shoe = aShoe([
            aCard().withRank(Rank.Seven).build(),
            aCard().withRank(Rank.Ace).build(),
            aCard().withRank(Rank.Nine).build(),
            aCard().withRank(Rank.Three).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        driver.assert.phase(round, 'insurance-pending');
        const next = applyRoundAction(round, { type: Move.Insurance });
        driver.assert.insuranceBet(next, 25);
        driver.assert.balance(next, 475);
        driver.assert.insuranceTaken(next);
        driver.assert.phase(next, 'player-action');
    });

    it('declined (Stand as decline): insuranceTaken set true (prevents re-offer), no insuranceBet, phase → player-action', () => {
        const shoe = aShoe([
            aCard().withRank(Rank.Seven).build(),
            aCard().withRank(Rank.Ace).build(),
            aCard().withRank(Rank.Nine).build(),
            aCard().withRank(Rank.Three).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        const next = applyRoundAction(round, { type: Move.Stand });
        driver.assert.insuranceTaken(next);
        driver.assert.insuranceBetUndefined(next);
        driver.assert.phase(next, 'player-action');
    });

    it('accepting insurance when dealer has BJ: phase → settling with hole revealed', () => {
        const shoe = aShoe([
            aCard().withRank(Rank.Seven).build(),
            aCard().withRank(Rank.Ace).build(),
            aCard().withRank(Rank.Nine).build(),
            aCard().withRank(Rank.King).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        driver.assert.phase(round, 'insurance-pending');
        const next = applyRoundAction(round, { type: Move.Insurance });
        driver.assert.phase(next, 'settling');
        driver.assert.holeCardIsRevealed(next);
        driver.assert.insuranceTaken(next);
        driver.assert.insuranceBet(next, 25);
    });

    it('declining insurance when dealer has BJ: phase → settling with hole revealed, insuranceTaken true, no insuranceBet', () => {
        const shoe = aShoe([
            aCard().withRank(Rank.Seven).build(),
            aCard().withRank(Rank.Ace).build(),
            aCard().withRank(Rank.Nine).build(),
            aCard().withRank(Rank.King).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        const next = applyRoundAction(round, { type: Move.Stand });
        driver.assert.phase(next, 'settling');
        driver.assert.holeCardIsRevealed(next);
        driver.assert.insuranceTaken(next);
        driver.assert.insuranceBetUndefined(next);
    });

    it('declining insurance when player has blackjack and dealer shows Ace but has no BJ: phase → settling immediately', () => {
        const shoe = aShoe([
            aCard().withRank(Rank.Ace).withSuit(Suit.Spades).build(),
            aCard().withRank(Rank.Ace).withSuit(Suit.Hearts).build(),
            aCard().withRank(Rank.King).build(),
            aCard().withRank(Rank.Three).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        driver.assert.phase(round, 'insurance-pending');
        const next = applyRoundAction(round, { type: Move.Stand });
        driver.assert.phase(next, 'settling');
        driver.assert.holeCardIsRevealed(next);
        driver.assert.insuranceTaken(next);
    });

    it('accepting insurance when player has blackjack and dealer shows Ace but has no BJ: phase → settling immediately', () => {
        const shoe = aShoe([
            aCard().withRank(Rank.Ace).withSuit(Suit.Spades).build(),
            aCard().withRank(Rank.Ace).withSuit(Suit.Hearts).build(),
            aCard().withRank(Rank.King).build(),
            aCard().withRank(Rank.Three).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        driver.assert.phase(round, 'insurance-pending');
        const next = applyRoundAction(round, { type: Move.Insurance });
        driver.assert.phase(next, 'settling');
        driver.assert.holeCardIsRevealed(next);
        driver.assert.insuranceTaken(next);
        driver.assert.insuranceBet(next, 25);
    });
});

describe('applyRoundAction — illegal moves', () => {
    let driver: ReturnType<typeof makeRoundDriver>;
    beforeEach(() => {
        driver = makeRoundDriver();
    });

    it('throws a descriptive error for an illegal move in the current phase', () => {
        const round = actionRound([]);
        driver.assert.throws(
            () => applyRoundAction(round, { type: Move.Insurance }),
            'applyRoundAction: Insurance is not legal in phase player-action',
        );
    });
});
