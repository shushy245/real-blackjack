import { Rank, type Card } from './types';

export type HandValue = {
    readonly value: number;
    readonly isSoft: boolean;
};

const rankValueMap: Record<Rank, number> = {
    [Rank.Two]: 2,
    [Rank.Three]: 3,
    [Rank.Four]: 4,
    [Rank.Five]: 5,
    [Rank.Six]: 6,
    [Rank.Seven]: 7,
    [Rank.Eight]: 8,
    [Rank.Nine]: 9,
    [Rank.Ten]: 10,
    [Rank.Jack]: 10,
    [Rank.Queen]: 10,
    [Rank.King]: 10,
    [Rank.Ace]: 11,
};

export const calculateHand = (cards: readonly Card[]): HandValue => {
    const rawValue = cards.reduce((sum, c) => sum + rankValueMap[c.rank], 0);
    const aceCount = cards.filter((c) => c.rank === Rank.Ace).length;
    const softReductions = Math.min(aceCount, Math.max(0, Math.ceil((rawValue - 21) / 10)));

    return { value: rawValue - softReductions * 10, isSoft: aceCount - softReductions > 0 };
};

export const isBust = (hand: HandValue): boolean => hand.value > 21;

export const isBlackjack = (cards: readonly Card[]): boolean => {
    if (cards.length !== 2) return false;
    const hand = calculateHand(cards);

    return hand.value === 21 && hand.isSoft;
};
