import { Rank, Suit, type Card } from '../../engine/types';

class CardBuilder {
    private state: Card = { rank: Rank.Two, suit: Suit.Spades };

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

export const aCard = (): CardBuilder => new CardBuilder();
