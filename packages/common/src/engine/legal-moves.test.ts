import { beforeEach, describe, it } from 'vitest';

import { Move, Rank, Suit } from './types';
import { getLegalMoves } from './legal-moves';
import { makeLegalMovesDriver } from './legal-moves.driver';
import { aCard, aHand, aRoundState } from '../testkit/builders';

describe('getLegalMoves', () => {
    let driver: ReturnType<typeof makeLegalMovesDriver>;
    beforeEach(() => {
        driver = makeLegalMovesDriver();
    });

    it('fresh 2-card hand always returns Hit and Stand', () => {
        const moves = getLegalMoves(aRoundState().build());
        driver.assert.contains(moves, Move.Hit);
        driver.assert.contains(moves, Move.Stand);
    });

    it('includes Double Down on 2-card hand with sufficient balance', () => {
        const moves = getLegalMoves(aRoundState().build());
        driver.assert.contains(moves, Move.Double);
    });

    it('excludes Double Down on 3+ card hand', () => {
        const state = aRoundState({
            playerHands: [aHand().withRanks([Rank.Three, Rank.Four, Rank.Seven]).build()],
        }).build();
        const moves = getLegalMoves(state);
        driver.assert.excludes(moves, Move.Double);
    });

    it('excludes Double Down when balance < bet', () => {
        const state = aRoundState({ balance: 40 }).build();
        const moves = getLegalMoves(state);
        driver.assert.excludes(moves, Move.Double);
    });

    it('includes Split on 2-card hand with matching ranks and fewer than 4 hands', () => {
        const state = aRoundState({
            playerHands: [
                aHand()
                    .withCards([
                        aCard().withRank(Rank.Eight).withSuit(Suit.Hearts).build(),
                        aCard().withRank(Rank.Eight).withSuit(Suit.Spades).build(),
                    ])
                    .build(),
            ],
        }).build();
        const moves = getLegalMoves(state);
        driver.assert.contains(moves, Move.Split);
    });

    it('excludes Split when cards differ in rank', () => {
        const moves = getLegalMoves(aRoundState().build());
        driver.assert.excludes(moves, Move.Split);
    });

    it('excludes Split when balance < originalBet', () => {
        const state = aRoundState({
            playerHands: [
                aHand()
                    .withCards([
                        aCard().withRank(Rank.Eight).withSuit(Suit.Hearts).build(),
                        aCard().withRank(Rank.Eight).withSuit(Suit.Spades).build(),
                    ])
                    .build(),
            ],
            balance: 40,
        }).build();
        const moves = getLegalMoves(state);
        driver.assert.excludes(moves, Move.Split);
    });

    it('excludes Split when already at 4 hands', () => {
        const state = aRoundState({
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
        }).build();
        const moves = getLegalMoves(state);
        driver.assert.excludes(moves, Move.Split);
    });

    it('includes Insurance when dealer shows Ace, first action, not yet taken', () => {
        const state = aRoundState({
            dealerHand: aHand().withRanks([Rank.Ace, Rank.Six]).build(),
        }).build();
        const moves = getLegalMoves(state);
        driver.assert.contains(moves, Move.Insurance);
    });

    it('excludes Insurance when dealer up card is not Ace', () => {
        const moves = getLegalMoves(aRoundState().build());
        driver.assert.excludes(moves, Move.Insurance);
    });

    it('excludes Insurance when not first action (3+ cards on active hand)', () => {
        const state = aRoundState({
            dealerHand: aHand().withRanks([Rank.Ace, Rank.Six]).build(),
            playerHands: [aHand().withRanks([Rank.Three, Rank.Four, Rank.Seven]).build()],
        }).build();
        const moves = getLegalMoves(state);
        driver.assert.excludes(moves, Move.Insurance);
    });

    it('excludes Insurance when already taken this round', () => {
        const state = aRoundState({
            dealerHand: aHand().withRanks([Rank.Ace, Rank.Six]).build(),
            insuranceTaken: true,
        }).build();
        const moves = getLegalMoves(state);
        driver.assert.excludes(moves, Move.Insurance);
    });

    it('returns empty array when phase is not player-action or insurance-pending', () => {
        const state = aRoundState({ phase: 'dealer-turn' }).build();
        driver.assert.equals(getLegalMoves(state), []);
    });

    it('returns [Insurance, Stand] when phase is insurance-pending', () => {
        const state = aRoundState({ phase: 'insurance-pending' }).build();
        driver.assert.equals(getLegalMoves(state), [Move.Insurance, Move.Stand]);
    });

    it('does not allow additional moves when user has blackjack and dealer has a non-ace (Ace first)', () => {
        const state = aRoundState({
            playerHands: [aHand().withRanks([Rank.Ace, Rank.King]).build()],
        }).build();
        driver.assert.equals(getLegalMoves(state), []);
    });

    it('does not allow additional moves when user has blackjack and dealer has a non-ace (King first)', () => {
        const state = aRoundState({
            playerHands: [aHand().withRanks([Rank.King, Rank.Ace]).build()],
        }).build();
        driver.assert.equals(getLegalMoves(state), []);
    });

    it('does not allow additional moves when user has blackjack and dealer has an ace', () => {
        const state = aRoundState({
            playerHands: [aHand().withRanks([Rank.Ace, Rank.King]).build()],
            dealerHand: aHand().withRanks([Rank.Ace, Rank.King]).build(),
        }).build();
        driver.assert.equals(getLegalMoves(state), []);
    });
});
