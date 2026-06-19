import { type RoundState } from './round';
import { calculateHand, isBust } from './hand';

export type HandOutcome = 'win' | 'lose' | 'push' | 'blackjack';

export type HandResult = {
    readonly handIndex: number;
    readonly outcome: HandOutcome;
    readonly payout: number;
};

const settleHand = (
    hand: readonly import('./types').Card[],
    handIndex: number,
    bet: number,
    dealerBJ: boolean,
    dealerHandValue: ReturnType<typeof calculateHand>,
    insuranceBet: number | undefined,
    splitOccurred: boolean,
): HandResult => {
    const playerHand = calculateHand(hand);
    const playerBJ = hand.length === 2 && playerHand.value === 21 && playerHand.isSoft;

    // Insurance taken + dealer BJ: main bet loses; insurance payout (insuranceDelta) covers the loss
    if (dealerBJ && insuranceBet !== undefined && !playerBJ) return { handIndex, outcome: 'lose', payout: -bet };

    if (isBust(playerHand)) return { handIndex, outcome: 'lose', payout: -bet };

    if (playerBJ) {
        if (dealerBJ) return { handIndex, outcome: 'push', payout: 0 };
        // Split-hand natural 21 pays 1:1, not 3:2 (standard casino rule)
        if (splitOccurred) return { handIndex, outcome: 'win', payout: bet };

        return { handIndex, outcome: 'blackjack', payout: Math.floor(bet * 1.5) };
    }

    if (dealerBJ) return { handIndex, outcome: 'lose', payout: -bet };

    if (isBust(dealerHandValue)) return { handIndex, outcome: 'win', payout: bet };

    if (playerHand.value > dealerHandValue.value) return { handIndex, outcome: 'win', payout: bet };
    if (playerHand.value < dealerHandValue.value) return { handIndex, outcome: 'lose', payout: -bet };

    return { handIndex, outcome: 'push', payout: 0 };
};

export const settleRound = (state: RoundState): { netDelta: number; handResults: HandResult[] } => {
    const dealerHandValue = calculateHand(state.dealerCards);
    const dealerBJ = state.dealerCards.length === 2 && dealerHandValue.value === 21 && dealerHandValue.isSoft;

    const handResults: HandResult[] = state.playerHands.map((hand, i) => {
        const bet = state.handBets[i] ?? state.originalBet;

        return settleHand(hand, i, bet, dealerBJ, dealerHandValue, state.insuranceBet, state.splitOccurred);
    });

    const insuranceDelta =
        state.insuranceBet === undefined ? 0 : dealerBJ ? state.insuranceBet * 2 : -state.insuranceBet;

    const netDelta = handResults.reduce((sum, r) => sum + r.payout, 0) + insuranceDelta;

    return { netDelta, handResults };
};
