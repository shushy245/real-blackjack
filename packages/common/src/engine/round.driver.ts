import { expect } from 'vitest';

import type { RoundPhase, RoundState } from './round';

type RoundDriver = {
    assert: {
        phase: (round: RoundState, expected: RoundPhase) => void;
        holeCardIsRevealed: (round: RoundState) => void;
        holeCardIsNotRevealed: (round: RoundState) => void;
        playerCardCount: (round: RoundState, handIndex: number, count: number) => void;
        dealerCardCount: (round: RoundState, count: number) => void;
        shoeSize: (round: RoundState, count: number) => void;
        handCount: (round: RoundState, count: number) => void;
        activeHandIndex: (round: RoundState, index: number) => void;
        activeBet: (round: RoundState, amount: number) => void;
        balance: (round: RoundState, amount: number) => void;
        insuranceBet: (round: RoundState, amount: number) => void;
        insuranceBetUndefined: (round: RoundState) => void;
        insuranceTaken: (round: RoundState) => void;
        throws: (fn: () => unknown, message?: string) => void;
    };
};

export const makeRoundDriver = (): RoundDriver => ({
    assert: {
        phase: (round, expected): void => {
            expect(round.phase).toBe(expected);
        },
        holeCardIsRevealed: (round): void => {
            expect(round.holeCardRevealed).toBe(true);
        },
        holeCardIsNotRevealed: (round): void => {
            expect(round.holeCardRevealed).toBe(false);
        },
        playerCardCount: (round, handIndex, count): void => {
            const hand = round.playerHands[handIndex];
            if (hand === undefined) throw new Error(`playerCardCount: no hand at index ${handIndex}`);
            expect(hand.cards).toHaveLength(count);
        },
        dealerCardCount: (round, count): void => {
            expect(round.dealerHand.cards).toHaveLength(count);
        },
        shoeSize: (round, count): void => {
            expect(round.shoe.cards.length).toBe(count);
        },
        handCount: (round, count): void => {
            expect(round.playerHands).toHaveLength(count);
        },
        activeHandIndex: (round, index): void => {
            expect(round.activeHandIndex).toBe(index);
        },
        activeBet: (round, amount): void => {
            expect(round.activeBet).toBe(amount);
        },
        balance: (round, amount): void => {
            expect(round.balance).toBe(amount);
        },
        insuranceBet: (round, amount): void => {
            expect(round.insuranceBet).toBe(amount);
        },
        insuranceBetUndefined: (round): void => {
            expect(round.insuranceBet).toBeUndefined();
        },
        insuranceTaken: (round): void => {
            expect(round.insuranceTaken).toBe(true);
        },
        throws: (fn, message): void => {
            if (message !== undefined) {
                expect(fn).toThrow(message);
            } else {
                expect(fn).toThrow();
            }
        },
    },
});
