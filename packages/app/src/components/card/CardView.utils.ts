import { Rank, Suit } from '@real-blackjack/common';

export const CARD_RATIO = 98 / 70;
export const GOLD = '#C4A44A';
export const NAVY = '#1B2A4A';

export const suitSymbolMap: Record<Suit, string> = {
    [Suit.Hearts]: '♥',
    [Suit.Diamonds]: '♦',
    [Suit.Clubs]: '♣',
    [Suit.Spades]: '♠',
};

export const rankLabelMap: Record<Rank, string> = {
    [Rank.Two]: '2',
    [Rank.Three]: '3',
    [Rank.Four]: '4',
    [Rank.Five]: '5',
    [Rank.Six]: '6',
    [Rank.Seven]: '7',
    [Rank.Eight]: '8',
    [Rank.Nine]: '9',
    [Rank.Ten]: '10',
    [Rank.Jack]: 'J',
    [Rank.Queen]: 'Q',
    [Rank.King]: 'K',
    [Rank.Ace]: 'A',
};

export const suitColorMap: Record<Suit, string> = {
    [Suit.Hearts]: '#C0111A',
    [Suit.Diamonds]: '#C0111A',
    [Suit.Clubs]: '#1A1A2E',
    [Suit.Spades]: '#1A1A2E',
};

export type PipPosition = { readonly x: number; readonly y: number };

// All pip coordinates are in the 70×98 card viewBox.
// Center pip area: x ∈ [17,53], y ∈ [34,68]
export const pipPositionMap: Record<Rank, readonly PipPosition[]> = {
    [Rank.Ace]: [],
    [Rank.Two]: [
        { x: 35, y: 38 },
        { x: 35, y: 63 },
    ],
    [Rank.Three]: [
        { x: 35, y: 37 },
        { x: 35, y: 50 },
        { x: 35, y: 63 },
    ],
    [Rank.Four]: [
        { x: 21, y: 38 },
        { x: 49, y: 38 },
        { x: 21, y: 63 },
        { x: 49, y: 63 },
    ],
    [Rank.Five]: [
        { x: 21, y: 38 },
        { x: 49, y: 38 },
        { x: 35, y: 50 },
        { x: 21, y: 63 },
        { x: 49, y: 63 },
    ],
    [Rank.Six]: [
        { x: 21, y: 38 },
        { x: 49, y: 38 },
        { x: 21, y: 50 },
        { x: 49, y: 50 },
        { x: 21, y: 63 },
        { x: 49, y: 63 },
    ],
    [Rank.Seven]: [
        { x: 21, y: 37 },
        { x: 49, y: 37 },
        { x: 35, y: 44 },
        { x: 21, y: 50 },
        { x: 49, y: 50 },
        { x: 21, y: 63 },
        { x: 49, y: 63 },
    ],
    [Rank.Eight]: [
        { x: 21, y: 37 },
        { x: 49, y: 37 },
        { x: 35, y: 43 },
        { x: 21, y: 50 },
        { x: 49, y: 50 },
        { x: 35, y: 57 },
        { x: 21, y: 63 },
        { x: 49, y: 63 },
    ],
    [Rank.Nine]: [
        { x: 21, y: 37 },
        { x: 49, y: 37 },
        { x: 21, y: 45 },
        { x: 49, y: 45 },
        { x: 35, y: 50 },
        { x: 21, y: 56 },
        { x: 49, y: 56 },
        { x: 21, y: 63 },
        { x: 49, y: 63 },
    ],
    [Rank.Ten]: [
        { x: 21, y: 37 },
        { x: 49, y: 37 },
        { x: 35, y: 41 },
        { x: 21, y: 47 },
        { x: 49, y: 47 },
        { x: 21, y: 55 },
        { x: 49, y: 55 },
        { x: 35, y: 60 },
        { x: 21, y: 64 },
        { x: 49, y: 64 },
    ],
    [Rank.Jack]: [],
    [Rank.Queen]: [],
    [Rank.King]: [],
};

export const isFaceOrAce = (rank: Rank): boolean =>
    rank === Rank.Jack || rank === Rank.Queen || rank === Rank.King || rank === Rank.Ace;

export const isWideRankLabel = (rankLabel: string): boolean => rankLabel.length > 1;
