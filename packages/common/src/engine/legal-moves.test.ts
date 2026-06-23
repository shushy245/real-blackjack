import { describe, expect, it } from 'vitest';

import { Move, Rank, Suit } from './types';
import { getLegalMoves } from './legal-moves';
import { aCard, aRoundState } from '../testkit/builders';

describe('getLegalMoves', () => {
    it('fresh 2-card hand always returns Hit and Stand', () => {
        const moves = getLegalMoves(aRoundState().build());

        expect(moves).toContain(Move.Hit);
        expect(moves).toContain(Move.Stand);
    });

    it('includes Double Down on 2-card hand with sufficient balance', () => {
        const moves = getLegalMoves(aRoundState().build());

        expect(moves).toContain(Move.Double);
    });

    it('excludes Double Down on 3+ card hand', () => {
        const state = aRoundState({
            playerHands: [
                [
                    aCard({ rank: Rank.Three }).build(),
                    aCard({ rank: Rank.Four }).build(),
                    aCard({ rank: Rank.Seven }).build(),
                ],
            ],
        }).build();
        const moves = getLegalMoves(state);

        expect(moves).not.toContain(Move.Double);
    });

    it('excludes Double Down when balance < bet', () => {
        const state = aRoundState({ balance: 40 }).build();
        const moves = getLegalMoves(state);

        expect(moves).not.toContain(Move.Double);
    });

    it('includes Split on 2-card hand with matching ranks and fewer than 4 hands', () => {
        const state = aRoundState({
            playerHands: [
                [
                    aCard({ rank: Rank.Eight, suit: Suit.Hearts }).build(),
                    aCard({ rank: Rank.Eight, suit: Suit.Spades }).build(),
                ],
            ],
        }).build();
        const moves = getLegalMoves(state);

        expect(moves).toContain(Move.Split);
    });

    it('excludes Split when cards differ in rank', () => {
        const moves = getLegalMoves(aRoundState().build());

        expect(moves).not.toContain(Move.Split);
    });

    it('excludes Split when balance < originalBet', () => {
        const state = aRoundState({
            playerHands: [
                [
                    aCard({ rank: Rank.Eight, suit: Suit.Hearts }).build(),
                    aCard({ rank: Rank.Eight, suit: Suit.Spades }).build(),
                ],
            ],
            balance: 40,
        }).build();
        const moves = getLegalMoves(state);

        expect(moves).not.toContain(Move.Split);
    });

    it('excludes Split when already at 4 hands', () => {
        const state = aRoundState({
            playerHands: [
                [
                    aCard({ rank: Rank.Eight, suit: Suit.Hearts }).build(),
                    aCard({ rank: Rank.Eight, suit: Suit.Spades }).build(),
                ],
                [aCard({ rank: Rank.Eight, suit: Suit.Clubs }).build(), aCard({ rank: Rank.Three }).build()],
                [aCard({ rank: Rank.Eight, suit: Suit.Diamonds }).build(), aCard({ rank: Rank.Five }).build()],
                [aCard({ rank: Rank.Two }).build(), aCard({ rank: Rank.Four }).build()],
            ],
        }).build();
        const moves = getLegalMoves(state);

        expect(moves).not.toContain(Move.Split);
    });

    it('includes Insurance when dealer shows Ace, first action, not yet taken', () => {
        const state = aRoundState({
            dealerCards: [aCard({ rank: Rank.Ace }).build(), aCard({ rank: Rank.Six }).build()],
        }).build();
        const moves = getLegalMoves(state);

        expect(moves).toContain(Move.Insurance);
    });

    it('excludes Insurance when dealer up card is not Ace', () => {
        const moves = getLegalMoves(aRoundState().build());

        expect(moves).not.toContain(Move.Insurance);
    });

    it('excludes Insurance when not first action (3+ cards on active hand)', () => {
        const state = aRoundState({
            dealerCards: [aCard({ rank: Rank.Ace }).build(), aCard({ rank: Rank.Six }).build()],
            playerHands: [
                [
                    aCard({ rank: Rank.Three }).build(),
                    aCard({ rank: Rank.Four }).build(),
                    aCard({ rank: Rank.Seven }).build(),
                ],
            ],
        }).build();
        const moves = getLegalMoves(state);

        expect(moves).not.toContain(Move.Insurance);
    });

    it('excludes Insurance when already taken this round', () => {
        const state = aRoundState({
            dealerCards: [aCard({ rank: Rank.Ace }).build(), aCard({ rank: Rank.Six }).build()],
            insuranceTaken: true,
        }).build();
        const moves = getLegalMoves(state);

        expect(moves).not.toContain(Move.Insurance);
    });

    it('returns empty array when phase is not player-action or insurance-pending', () => {
        const state = aRoundState({ phase: 'dealer-turn' }).build();

        expect(getLegalMoves(state)).toEqual([]);
    });

    it('returns [Insurance, Stand] when phase is insurance-pending', () => {
        const state = aRoundState({ phase: 'insurance-pending' }).build();

        expect(getLegalMoves(state)).toEqual([Move.Insurance, Move.Stand]);
    });

    it('does not allow additional moves when user has blackjack and dealer has a non-ace', () => {
        const state1 = aRoundState({
            playerHands: [[aCard({ rank: Rank.Ace }).build(), aCard({ rank: Rank.King }).build()]],
        }).build();
        const state2 = aRoundState({
            playerHands: [[aCard({ rank: Rank.King }).build(), aCard({ rank: Rank.Ace }).build()]],
        }).build();

        expect(getLegalMoves(state1)).toEqual([]);
        expect(getLegalMoves(state2)).toEqual([]);
    });

    it('does not allow additional moves when user has blackjack and dealer has an ace', () => {
        const state = aRoundState({
            playerHands: [[aCard({ rank: Rank.Ace }).build(), aCard({ rank: Rank.King }).build()]],
            dealerCards: [aCard({ rank: Rank.Ace }).build(), aCard({ rank: Rank.King }).build()],
        }).build();

        expect(getLegalMoves(state)).toEqual([]);
    });
});
