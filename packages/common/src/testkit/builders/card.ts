import { Rank, Suit, type Card } from '../../engine/types';

class CardBuilder {
    private state: Card;

    constructor(overrides?: Partial<Card>) {
        this.state = { rank: Rank.Two, suit: Suit.Spades, ...overrides };
    }

    withRank(rank: Rank): this {
        this.state = { ...this.state, rank };

        return this;
    }

    withSuit(suit: Suit): this {
        this.state = { ...this.state, suit };

        return this;
    }

    build(): Card {
        return { ...this.state };
    }
}

export const aCard = (...args: ConstructorParameters<typeof CardBuilder>): CardBuilder => new CardBuilder(...args);
