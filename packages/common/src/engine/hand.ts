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
    let value = 0;
    let softAces = 0;

    for (const card of cards) {
        value += rankValueMap[card.rank];
        if (card.rank === Rank.Ace) softAces++;
    }

    while (value > 21 && softAces > 0) {
        value -= 10;
        softAces--;
    }

    return { value, isSoft: softAces > 0 };
};

export const isBust = (hand: HandValue): boolean => hand.value > 21;

export const isBlackjack = (cards: readonly Card[]): boolean => {
    if (cards.length !== 2) return false;
    const hand = calculateHand(cards);

    return hand.value === 21 && hand.isSoft;
};
