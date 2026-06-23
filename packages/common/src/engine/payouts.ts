import { type RoundState } from './round';
import type { Hand, HandValue } from './hand';

export type HandOutcome = 'win' | 'lose' | 'push' | 'blackjack';

export type HandResult = {
    readonly handIndex: number;
    readonly outcome: HandOutcome;
    readonly payout: number;
};

const settleHand = (
    hand: Hand,
    handIndex: number,
    bet: number,
    dealerBJ: boolean,
    dealerHandValue: HandValue,
    insuranceBet: number | undefined,
    splitOccurred: boolean,
): HandResult => {
    const playerBJ = hand.isBlackjack();

    // Insurance taken + dealer BJ: main bet loses; insurance payout (insuranceDelta) covers the loss
    if (dealerBJ && insuranceBet !== undefined && !playerBJ) return { handIndex, outcome: 'lose', payout: -bet };

    if (hand.isBust()) return { handIndex, outcome: 'lose', payout: -bet };

    if (playerBJ) {
        if (dealerBJ) return { handIndex, outcome: 'push', payout: 0 };
        // Split-hand natural 21 pays 1:1, not 3:2 (standard casino rule)
        if (splitOccurred) return { handIndex, outcome: 'win', payout: bet };

        return { handIndex, outcome: 'blackjack', payout: Math.floor(bet * 1.5) };
    }

    if (dealerBJ) return { handIndex, outcome: 'lose', payout: -bet };

    if (dealerHandValue.value > 21) return { handIndex, outcome: 'win', payout: bet };

    if (hand.value().value > dealerHandValue.value) return { handIndex, outcome: 'win', payout: bet };
    if (hand.value().value < dealerHandValue.value) return { handIndex, outcome: 'lose', payout: -bet };

    return { handIndex, outcome: 'push', payout: 0 };
};

export const settleRound = (state: RoundState): { netDelta: number; handResults: HandResult[] } => {
    const dealerBJ = state.dealerHand.isBlackjack();
    const dealerHandValue = state.dealerHand.value();

    const handResults: HandResult[] = state.playerHands.map((hand, i) => {
        const bet = state.handBets[i] ?? state.originalBet;

        return settleHand(hand, i, bet, dealerBJ, dealerHandValue, state.insuranceBet, state.splitOccurred);
    });

    const insuranceDelta =
        state.insuranceBet === undefined ? 0 : dealerBJ ? state.insuranceBet * 2 : -state.insuranceBet;

    const netDelta = handResults.reduce((sum, r) => sum + r.payout, 0) + insuranceDelta;

    return { netDelta, handResults };
};
