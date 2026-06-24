import { beforeEach, describe, it } from 'vitest';

import type { Card } from './types';
import { settleRound } from './payouts';
import { Move, Rank, Suit } from './types';
import { makePayoutsDriver } from './payouts.driver';
import { aCard, aHand, aRoundState, aShoe } from '../testkit/builders';
import { applyRoundAction, createRound, runDealerTurn } from './round';

// deal phase order: p1, d-up, p2, d-hole, then extra cards
const dealerTurnRound = (playerCards: [Card, Card], dealerUp: Card, dealerHole: Card, extraCards: Card[]) => {
    const shoe = aShoe()
        .withCards([playerCards[0], dealerUp, playerCards[1], dealerHole, ...extraCards])
        .build();

    return createRound(50, 500, shoe);
};

describe('runDealerTurn', () => {
    let driver: ReturnType<typeof makePayoutsDriver>;
    beforeEach(() => {
        driver = makePayoutsDriver();
    });

    it('reveals hole card at start of dealer turn', () => {
        const round = dealerTurnRound(
            [aCard().withRank(Rank.Seven).build(), aCard().withRank(Rank.King).build()],
            aCard().withRank(Rank.Six).build(),
            aCard().withRank(Rank.King).build(),
            [],
        );
        const stood = applyRoundAction(round, { type: Move.Stand });
        const dealerRound = runDealerTurn(stood);
        driver.assert.holeCardIsRevealed(dealerRound);
    });

    it('dealer draws cards until shouldDealerHit is false', () => {
        const round = dealerTurnRound(
            [aCard().withRank(Rank.Seven).build(), aCard().withRank(Rank.King).build()],
            aCard().withRank(Rank.Six).build(),
            aCard().withRank(Rank.King).build(),
            [aCard().withRank(Rank.Two).build()],
        );
        const stood = applyRoundAction(round, { type: Move.Stand });
        const dealerRound = runDealerTurn(stood);
        driver.assert.dealerCardCount(dealerRound, 3);
        driver.assert.phase(dealerRound, 'settling');
    });

    it('dealer stops on hard 17', () => {
        const round = dealerTurnRound(
            [aCard().withRank(Rank.Three).build(), aCard().withRank(Rank.King).build()],
            aCard().withRank(Rank.Seven).build(),
            aCard().withRank(Rank.King).build(),
            [],
        );
        const stood = applyRoundAction(round, { type: Move.Stand });
        const dealerRound = runDealerTurn(stood);
        driver.assert.dealerCardCount(dealerRound, 2);
    });

    it('dealer stops on soft 18+', () => {
        const round = dealerTurnRound(
            [aCard().withRank(Rank.Three).build(), aCard().withRank(Rank.King).build()],
            aCard().withRank(Rank.Ace).build(),
            aCard().withRank(Rank.Seven).build(),
            [],
        );
        // dealer up is Ace → insurance-pending; decline insurance to get to player-action
        const declined = applyRoundAction(round, { type: Move.Stand });
        const stood = applyRoundAction(declined, { type: Move.Stand });
        const dealerRound = runDealerTurn(stood);
        driver.assert.dealerCardCount(dealerRound, 2);
    });

    it('dealer does not draw additional cards after busting', () => {
        const round = dealerTurnRound(
            [aCard().withRank(Rank.Three).build(), aCard().withRank(Rank.King).build()],
            aCard().withRank(Rank.Six).build(),
            aCard().withRank(Rank.King).build(),
            [aCard().withRank(Rank.King).build()],
        );
        const stood = applyRoundAction(round, { type: Move.Stand });
        const dealerRound = runDealerTurn(stood);
        driver.assert.dealerCardCount(dealerRound, 3);
        driver.assert.phase(dealerRound, 'settling');
    });
});

describe('settleRound', () => {
    let driver: ReturnType<typeof makePayoutsDriver>;
    beforeEach(() => {
        driver = makePayoutsDriver();
    });

    it('player bust → loss regardless of dealer result', () => {
        const shoe = aShoe()
            .withCards([
                aCard().withRank(Rank.Seven).build(),
                aCard().withRank(Rank.Six).build(),
                aCard().withRank(Rank.Nine).build(),
                aCard().withRank(Rank.King).build(),
                aCard().withRank(Rank.King).build(),
            ])
            .build();
        const round = createRound(50, 500, shoe);
        const hit = applyRoundAction(round, { type: Move.Hit });
        const settled = runDealerTurn(hit);
        const result = settleRound(settled);
        driver.assert.outcome(result, 0, 'lose');
        driver.assert.netDeltaLessThan(result, 0);
    });

    it('dealer bust, player not bust → player wins 1:1', () => {
        const shoe = aShoe()
            .withCards([
                aCard().withRank(Rank.Seven).build(),
                aCard().withRank(Rank.Six).build(),
                aCard().withRank(Rank.King).build(),
                aCard().withRank(Rank.King).build(),
                aCard().withRank(Rank.King).build(),
            ])
            .build();
        const round = createRound(50, 500, shoe);
        const stood = applyRoundAction(round, { type: Move.Stand });
        const settled = runDealerTurn(stood);
        const result = settleRound(settled);
        driver.assert.outcome(result, 0, 'win');
        driver.assert.netDelta(result, 50);
    });

    it('player higher total → win 1:1', () => {
        const shoe = aShoe()
            .withCards([
                aCard().withRank(Rank.Nine).build(),
                aCard().withRank(Rank.Six).build(),
                aCard().withRank(Rank.King).build(),
                aCard().withRank(Rank.King).build(),
                aCard().withRank(Rank.Two).build(),
            ])
            .build();
        const round = createRound(50, 500, shoe);
        const stood = applyRoundAction(round, { type: Move.Stand });
        const settled = runDealerTurn(stood);
        const result = settleRound(settled);
        driver.assert.outcome(result, 0, 'win');
        driver.assert.netDelta(result, 50);
    });

    it('equal totals (non-BJ) → push', () => {
        const shoe = aShoe()
            .withCards([
                aCard().withRank(Rank.Seven).build(),
                aCard().withRank(Rank.Seven).build(),
                aCard().withRank(Rank.King).build(),
                aCard().withRank(Rank.King).build(),
            ])
            .build();
        const round = createRound(50, 500, shoe);
        const stood = applyRoundAction(round, { type: Move.Stand });
        const settled = runDealerTurn(stood);
        const result = settleRound(settled);
        driver.assert.outcome(result, 0, 'push');
        driver.assert.netDelta(result, 0);
    });

    it('player BJ, dealer not BJ → win 3:2', () => {
        const shoe = aShoe()
            .withCards([
                aCard().withRank(Rank.Ace).build(),
                aCard().withRank(Rank.Six).build(),
                aCard().withRank(Rank.King).build(),
                aCard().withRank(Rank.Nine).build(),
            ])
            .build();
        const round = createRound(50, 500, shoe);
        const result = settleRound(round);
        driver.assert.outcome(result, 0, 'blackjack');
        driver.assert.netDelta(result, 75);
    });

    it('player BJ, dealer BJ → push', () => {
        const shoe = aShoe()
            .withCards([
                aCard().withRank(Rank.Ace).withSuit(Suit.Spades).build(),
                aCard().withRank(Rank.Ace).withSuit(Suit.Hearts).build(),
                aCard().withRank(Rank.King).withSuit(Suit.Spades).build(),
                aCard().withRank(Rank.King).withSuit(Suit.Hearts).build(),
            ])
            .build();
        const round = createRound(50, 500, shoe);
        const result = settleRound(round);
        driver.assert.outcome(result, 0, 'push');
        driver.assert.netDelta(result, 0);
    });

    it('insurance taken + dealer BJ → netDelta is 0 (insurance profit covers main bet loss)', () => {
        const shoe = aShoe()
            .withCards([
                aCard().withRank(Rank.Seven).build(),
                aCard().withRank(Rank.Ace).build(),
                aCard().withRank(Rank.Nine).build(),
                aCard().withRank(Rank.King).build(),
            ])
            .build();
        const round = createRound(50, 500, shoe);
        driver.assert.phase(round, 'insurance-pending');
        const accepted = applyRoundAction(round, { type: Move.Insurance });
        driver.assert.phase(accepted, 'settling');
        const result = settleRound(accepted);
        driver.assert.netDelta(result, 0);
    });

    it('insurance declined + dealer BJ → player loses main bet (no free push)', () => {
        const shoe = aShoe()
            .withCards([
                aCard().withRank(Rank.Seven).build(),
                aCard().withRank(Rank.Ace).build(),
                aCard().withRank(Rank.Nine).build(),
                aCard().withRank(Rank.King).build(),
            ])
            .build();
        const round = createRound(50, 500, shoe);
        const declined = applyRoundAction(round, { type: Move.Stand });
        driver.assert.phase(declined, 'settling');
        const result = settleRound(declined);
        driver.assert.netDelta(result, -50);
    });

    it('split hand with natural 21 (Ace + ten-value) pays 1:1, not 3:2', () => {
        const splitRound = aRoundState()
            .withPhase('settling')
            .withPlayerHands([
                aHand().withRanks([Rank.Ace, Rank.King]).build(),
                aHand().withRanks([Rank.Eight, Rank.Nine]).build(),
            ])
            .withDealerHand(aHand().withRanks([Rank.Six, Rank.Ten]).build())
            .withHoleCardRevealed(true)
            .withActiveHandIndex(1)
            .withHandBets([50, 50])
            .withBalance(450)
            .withSplitOccurred(true)
            .build();
        const result = settleRound(splitRound);
        driver.assert.outcome(result, 0, 'win');
        driver.assert.payout(result, 0, 50);
    });

    it('insurance + dealer no BJ → insurance lost; original bet settles normally', () => {
        const shoe = aShoe()
            .withCards([
                aCard().withRank(Rank.Seven).build(),
                aCard().withRank(Rank.Ace).build(),
                aCard().withRank(Rank.Nine).build(),
                aCard().withRank(Rank.Three).build(),
                aCard().withRank(Rank.Four).build(),
            ])
            .build();
        const round = createRound(50, 500, shoe);
        driver.assert.phase(round, 'insurance-pending');
        const accepted = applyRoundAction(round, { type: Move.Insurance });
        const stood = applyRoundAction(accepted, { type: Move.Stand });
        const settled = runDealerTurn(stood);
        const result = settleRound(settled);
        driver.assert.netDelta(result, -75);
    });
});
