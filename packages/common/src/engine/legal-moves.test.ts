import { describe, expect, it } from 'vitest';

import type { Card } from './types';
import type { RoundState } from './round';
import { Move, Rank, Suit } from './types';
import { getLegalMoves } from './legal-moves';

const card = (rank: Rank, suit = Suit.Spades): Card => ({ rank, suit });

const baseState = (): RoundState => ({
    phase: 'player-action',
    shoe: { cards: [], dealtCount: 0 },
    playerHands: [[card(Rank.Seven), card(Rank.Nine)]],
    dealerCards: [card(Rank.Six), card(Rank.King)],
    holeCardRevealed: false,
    activeHandIndex: 0,
    originalBet: 50,
    activeBet: 50,
    balance: 500,
    insuranceBet: undefined,
    insuranceTaken: false,
    splitOccurred: false,
    handBets: [50],
});

describe('getLegalMoves', () => {
    it('fresh 2-card hand always returns Hit and Stand', () => {
        const moves = getLegalMoves(baseState());

        expect(moves).toContain(Move.Hit);
        expect(moves).toContain(Move.Stand);
    });

    it('includes Double Down on 2-card hand with sufficient balance', () => {
        const moves = getLegalMoves(baseState());

        expect(moves).toContain(Move.Double);
    });

    it('excludes Double Down on 3+ card hand', () => {
        const state: RoundState = {
            ...baseState(),
            playerHands: [[card(Rank.Three), card(Rank.Four), card(Rank.Seven)]],
        };
        const moves = getLegalMoves(state);

        expect(moves).not.toContain(Move.Double);
    });

    it('excludes Double Down when balance < bet', () => {
        const state: RoundState = { ...baseState(), balance: 40 };
        const moves = getLegalMoves(state);

        expect(moves).not.toContain(Move.Double);
    });

    it('includes Split on 2-card hand with matching ranks and fewer than 4 hands', () => {
        const state: RoundState = {
            ...baseState(),
            playerHands: [[card(Rank.Eight, Suit.Hearts), card(Rank.Eight, Suit.Spades)]],
        };
        const moves = getLegalMoves(state);

        expect(moves).toContain(Move.Split);
    });

    it('excludes Split when cards differ in rank', () => {
        const moves = getLegalMoves(baseState());

        expect(moves).not.toContain(Move.Split);
    });

    it('excludes Split when balance < originalBet', () => {
        const state: RoundState = {
            ...baseState(),
            playerHands: [[card(Rank.Eight, Suit.Hearts), card(Rank.Eight, Suit.Spades)]],
            balance: 40, // less than originalBet (50)
        };
        const moves = getLegalMoves(state);

        expect(moves).not.toContain(Move.Split);
    });

    it('excludes Split when already at 4 hands', () => {
        const state: RoundState = {
            ...baseState(),
            playerHands: [
                [card(Rank.Eight, Suit.Hearts), card(Rank.Eight, Suit.Spades)],
                [card(Rank.Eight, Suit.Clubs), card(Rank.Three)],
                [card(Rank.Eight, Suit.Diamonds), card(Rank.Five)],
                [card(Rank.Two), card(Rank.Four)],
            ],
        };
        const moves = getLegalMoves(state);

        expect(moves).not.toContain(Move.Split);
    });

    it('includes Insurance when dealer shows Ace, first action, not yet taken', () => {
        const state: RoundState = {
            ...baseState(),
            dealerCards: [card(Rank.Ace), card(Rank.Six)],
            insuranceTaken: false,
            playerHands: [[card(Rank.Seven), card(Rank.Nine)]],
        };
        const moves = getLegalMoves(state);

        expect(moves).toContain(Move.Insurance);
    });

    it('excludes Insurance when dealer up card is not Ace', () => {
        const moves = getLegalMoves(baseState());

        expect(moves).not.toContain(Move.Insurance);
    });

    it('excludes Insurance when not first action (3+ cards on active hand)', () => {
        const state: RoundState = {
            ...baseState(),
            dealerCards: [card(Rank.Ace), card(Rank.Six)],
            playerHands: [[card(Rank.Three), card(Rank.Four), card(Rank.Seven)]],
        };
        const moves = getLegalMoves(state);

        expect(moves).not.toContain(Move.Insurance);
    });

    it('excludes Insurance when already taken this round', () => {
        const state: RoundState = {
            ...baseState(),
            dealerCards: [card(Rank.Ace), card(Rank.Six)],
            insuranceTaken: true,
        };
        const moves = getLegalMoves(state);

        expect(moves).not.toContain(Move.Insurance);
    });

    it('returns empty array when phase is not player-action or insurance-pending', () => {
        const state: RoundState = { ...baseState(), phase: 'dealer-turn' };

        expect(getLegalMoves(state)).toEqual([]);
    });

    it('returns [Insurance, Stand] when phase is insurance-pending', () => {
        const state: RoundState = { ...baseState(), phase: 'insurance-pending' };

        expect(getLegalMoves(state)).toEqual([Move.Insurance, Move.Stand]);
    });

    it('does not allow additional moves when user has blackjack and dealer has a non-ace', () => {
        const state: RoundState = {
            ...baseState(),
            playerHands: [[card(Rank.Ace), card(Rank.King)]],
            dealerCards: [card(Rank.Six), card(Rank.King)],
        };

        expect(getLegalMoves(state)).toEqual([]);
    });

    it('does not allow additional moves when user has blackjack and dealer has an ace', () => {
        const state: RoundState = {
            ...baseState(),
            playerHands: [[card(Rank.Ace), card(Rank.King)]],
            dealerCards: [card(Rank.Ace), card(Rank.King)],
        };

        expect(getLegalMoves(state)).toEqual([]);
    });
});
