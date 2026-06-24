import { expect } from 'vitest';

import type { HandResult } from './payouts';
import type { RoundPhase, RoundState } from './round';

type SettleResult = { netDelta: number; handResults: HandResult[] };

type PayoutsDriver = {
    assert: {
        phase: (round: RoundState, expected: RoundPhase) => void;
        holeCardIsRevealed: (round: RoundState) => void;
        dealerCardCount: (round: RoundState, count: number) => void;
        outcome: (result: SettleResult, index: number, expected: string) => void;
        payout: (result: SettleResult, index: number, expected: number) => void;
        netDelta: (result: SettleResult, expected: number) => void;
        netDeltaLessThan: (result: SettleResult, n: number) => void;
    };
};

export const makePayoutsDriver = (): PayoutsDriver => ({
    assert: {
        phase: (round, expected): void => {
            expect(round.phase).toBe(expected);
        },
        holeCardIsRevealed: (round): void => {
            expect(round.holeCardRevealed).toBe(true);
        },
        dealerCardCount: (round, count): void => {
            expect(round.dealerHand.cards).toHaveLength(count);
        },
        outcome: (result, index, expected): void => {
            const handResult = result.handResults[index];
            if (handResult === undefined) throw new Error(`outcome: no handResult at index ${index}`);
            expect(handResult.outcome).toBe(expected);
        },
        payout: (result, index, expected): void => {
            const handResult = result.handResults[index];
            if (handResult === undefined) throw new Error(`payout: no handResult at index ${index}`);
            expect(handResult.payout).toBe(expected);
        },
        netDelta: (result, expected): void => {
            expect(result.netDelta).toBe(expected);
        },
        netDeltaLessThan: (result, n): void => {
            expect(result.netDelta).toBeLessThan(n);
        },
    },
});
