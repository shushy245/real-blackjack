import { Move, Rank } from './types';
import { type RoundState } from './round';

export const getLegalMoves = (state: RoundState): Move[] => {
    if (state.phase === 'insurance-pending') return [Move.Insurance, Move.Stand];
    if (state.phase !== 'player-action') return [];

    const activeHand = state.playerHands[state.activeHandIndex];

    if (activeHand === undefined) return [];

    const firstCard = activeHand[0];
    const secondCard = activeHand[1];

    const isFirstAction = activeHand.length === 2;
    const moves: Move[] = [Move.Hit, Move.Stand];

    if (isFirstAction && firstCard?.rank === Rank.Ace) return [];

    if (isFirstAction && state.balance >= state.activeBet) moves.push(Move.Double);

    if (isFirstAction && state.playerHands.length < 4 && state.balance >= state.originalBet) {
        if (firstCard !== undefined && secondCard !== undefined && firstCard.rank === secondCard.rank)
            moves.push(Move.Split);
    }

    const dealerUpCard = state.dealerCards[0];
    if (isFirstAction && !state.insuranceTaken && dealerUpCard?.rank === Rank.Ace) moves.push(Move.Insurance);

    return moves;
};
