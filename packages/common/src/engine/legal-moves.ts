import { Move, Rank } from './types';
import { type RoundState } from './round';

export const getLegalMoves = (state: RoundState): Move[] => {
    if (state.phase === 'insurance-pending') return [Move.Insurance, Move.Stand];
    if (state.phase !== 'player-action') return [];

    const activeHand = state.playerHands[state.activeHandIndex];
    if (activeHand === undefined) return [];

    const isFirstAction = activeHand.length === 2;
    const moves: Move[] = [Move.Hit, Move.Stand];

    if (isFirstAction && state.balance >= state.activeBet) moves.push(Move.Double);

    if (isFirstAction && state.playerHands.length < 4) {
        const first = activeHand[0];
        const second = activeHand[1];
        if (first !== undefined && second !== undefined && first.rank === second.rank) moves.push(Move.Split);
    }

    const dealerUpCard = state.dealerCards[0];
    if (isFirstAction && !state.insuranceTaken && dealerUpCard?.rank === Rank.Ace) moves.push(Move.Insurance);

    return moves;
};
