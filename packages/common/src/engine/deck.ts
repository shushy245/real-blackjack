import { type Card, Rank, Suit } from './types';

const ALL_RANKS = Object.values(Rank);
const ALL_SUITS = Object.values(Suit);

export const createDeck = (): Card[] => ALL_SUITS.flatMap((suit) => ALL_RANKS.map((rank) => ({ rank, suit })));
