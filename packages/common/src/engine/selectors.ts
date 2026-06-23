import { type RoundState } from './round';

export const canAffordDouble = (state: RoundState): boolean => state.balance >= state.activeBet;

export const hasRoomToSplit = (state: RoundState): boolean => state.playerHands.length < 4;

export const canAffordSplit = (state: RoundState): boolean => state.balance >= state.originalBet;

export const dealerShowsAce = (state: RoundState): boolean => state.dealerHand.isUpCardAce();
