import { type Rng } from './rng';
import { isBlackjack } from './hand';
import { Rank, type Card } from './types';
import { type Shoe, dealCard } from './shoe';

export type RoundPhase = 'player-action' | 'insurance-pending' | 'dealer-turn' | 'settling';

export type RoundState = {
    readonly phase: RoundPhase;
    readonly shoe: Shoe;
    readonly playerHands: readonly (readonly Card[])[];
    readonly dealerCards: readonly Card[];
    readonly holeCardRevealed: boolean;
    readonly activeHandIndex: number;
    readonly originalBet: number;
    readonly activeBet: number;
    readonly balance: number;
    readonly insuranceBet: number | undefined;
    readonly insuranceTaken: boolean;
};

const TEN_VALUE_RANKS = new Set<Rank>([Rank.Ten, Rank.Jack, Rank.Queen, Rank.King]);

const resolveInitialPhase = (
    playerHand: readonly Card[],
    dealerUpCard: Card,
    dealerHoleCard: Card,
): { phase: RoundPhase; holeCardRevealed: boolean } => {
    const playerBJ = isBlackjack(playerHand);
    const dealerUpIsAce = dealerUpCard.rank === Rank.Ace;
    const dealerUpIsTenValue = TEN_VALUE_RANKS.has(dealerUpCard.rank);

    if (dealerUpIsAce) {
        const dealerBJ = TEN_VALUE_RANKS.has(dealerHoleCard.rank);
        if (dealerBJ) return { phase: 'settling', holeCardRevealed: true };

        return { phase: 'insurance-pending', holeCardRevealed: false };
    }

    if (dealerUpIsTenValue) {
        const dealerBJ = dealerHoleCard.rank === Rank.Ace;
        if (dealerBJ) return { phase: 'settling', holeCardRevealed: true };
    }

    if (playerBJ) return { phase: 'settling', holeCardRevealed: false };

    return { phase: 'player-action', holeCardRevealed: false };
};

export const createRound = (bet: number, balance: number, shoe: Shoe, _rng: Rng): RoundState => {
    const [p1, shoe1] = dealCard(shoe);
    const [d1, shoe2] = dealCard(shoe1);
    const [p2, shoe3] = dealCard(shoe2);
    const [d2, shoe4] = dealCard(shoe3);

    const playerHand: readonly Card[] = [p1, p2];
    const dealerCards: readonly Card[] = [d1, d2];

    const { phase, holeCardRevealed } = resolveInitialPhase(playerHand, d1, d2);

    return {
        phase,
        shoe: shoe4,
        playerHands: [playerHand],
        dealerCards,
        holeCardRevealed,
        activeHandIndex: 0,
        originalBet: bet,
        activeBet: bet,
        balance,
        insuranceBet: undefined,
        insuranceTaken: false,
    };
};
