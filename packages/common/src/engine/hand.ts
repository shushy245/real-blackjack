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

const calculateHand = (cards: readonly Card[]): HandValue => {
    const { rawValue, aceCount } = cards.reduce(
        (acc, c) => ({
            rawValue: acc.rawValue + rankValueMap[c.rank],
            aceCount: acc.aceCount + (c.rank === Rank.Ace ? 1 : 0),
        }),
        { rawValue: 0, aceCount: 0 },
    );
    const softReductions = Math.min(aceCount, Math.max(0, Math.ceil((rawValue - 21) / 10)));

    return { value: rawValue - softReductions * 10, isSoft: aceCount - softReductions > 0 };
};

export class Hand {
    readonly cards: readonly Card[];

    private constructor(cards: readonly Card[]) {
        this.cards = cards;
    }

    static of(cards: readonly Card[]): Hand {
        if (cards.length === 0) throw new Error('Hand.of: cannot create an empty hand');

        return new Hand(cards);
    }

    add(card: Card): Hand {
        return new Hand([...this.cards, card]);
    }

    upCard(): Card {
        const card = this.cards[0];
        if (card === undefined) throw new Error('Hand.upCard: empty hand');

        return card;
    }

    value(): HandValue {
        return calculateHand(this.cards);
    }

    isBust(): boolean {
        return this.value().value > 21;
    }

    isBlackjack(): boolean {
        if (this.cards.length !== 2) return false;
        const { value, isSoft } = this.value();

        return value === 21 && isSoft;
    }

    isFirstAction(): boolean {
        return this.cards.length === 2;
    }

    isUpCardAce(): boolean {
        return this.upCard().rank === Rank.Ace;
    }

    isPair(): boolean {
        if (this.cards.length !== 2) return false;
        const [first, second] = this.cards;

        return first !== undefined && second !== undefined && first.rank === second.rank;
    }
}
