import { isBlackjack } from './hand';
import { type RoundState } from './round';
import { type Card, Move, Rank } from './types';

const isFirstAction = (hand: readonly Card[]): boolean => hand.length === 2;

const isPair = (hand: readonly Card[]): boolean => {
    const [first, second] = hand;

    return first !== undefined && second !== undefined && first.rank === second.rank;
};

const canAffordDouble = (state: RoundState): boolean => state.balance >= state.activeBet;

const hasRoomToSplit = (state: RoundState): boolean => state.playerHands.length < 4;

const canAffordSplit = (state: RoundState): boolean => state.balance >= state.originalBet;

const dealerShowsAce = (state: RoundState): boolean => state.dealerCards[0].rank === Rank.Ace;

export const getLegalMoves = (state: RoundState): Move[] => {
    if (state.phase === 'insurance-pending') return [Move.Insurance, Move.Stand];
    if (state.phase !== 'player-action') return [];

    const activeHand = state.playerHands[state.activeHandIndex];
    if (activeHand === undefined) return [];

    const firstAction = isFirstAction(activeHand);

    if (firstAction && isBlackjack(activeHand)) return [];

    const moves: Move[] = [Move.Hit, Move.Stand];

    if (firstAction && canAffordDouble(state)) moves.push(Move.Double);
    if (firstAction && hasRoomToSplit(state) && canAffordSplit(state) && isPair(activeHand)) moves.push(Move.Split);
    if (firstAction && !state.insuranceTaken && dealerShowsAce(state)) moves.push(Move.Insurance);

    return moves;
};
