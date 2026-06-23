import { Move } from './types';
import { type RoundState } from './round';
import { canAffordDouble, canAffordSplit, dealerShowsAce, hasRoomToSplit } from './selectors';

export const getLegalMoves = (state: RoundState): Move[] => {
    if (state.phase === 'insurance-pending') return [Move.Insurance, Move.Stand];
    if (state.phase !== 'player-action') return [];

    const activeHand = state.playerHands[state.activeHandIndex];
    if (activeHand === undefined) return [];

    if (activeHand.isFirstAction() && activeHand.isBlackjack()) return [];

    const moves: Move[] = [Move.Hit, Move.Stand];

    if (activeHand.isFirstAction() && canAffordDouble(state)) moves.push(Move.Double);
    if (activeHand.isFirstAction() && hasRoomToSplit(state) && canAffordSplit(state) && activeHand.isPair())
        moves.push(Move.Split);
    if (activeHand.isFirstAction() && !state.insuranceTaken && dealerShowsAce(state)) moves.push(Move.Insurance);

    return moves;
};
