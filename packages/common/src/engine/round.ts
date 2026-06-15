import { type Shoe } from './shoe';
import { type Card } from './types';

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
