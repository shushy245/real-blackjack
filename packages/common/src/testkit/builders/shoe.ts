import type { Shoe } from '../../engine/shoe';
import { Rank, Suit, type Card } from '../../engine/types';

const SHOE_SIZE = 312;

class ShoeBuilder {
    private cards: readonly Card[] = [];

    withCards(cards: Card[]): this {
        this.cards = [...cards];

        return this;
    }

    build(): Shoe {
        const padding = Array.from(
            { length: Math.max(0, SHOE_SIZE - this.cards.length) },
            (): Card => ({ rank: Rank.Two, suit: Suit.Spades }),
        );

        return { cards: [...this.cards, ...padding], dealtCount: 0 };
    }
}

export const aShoe = (): ShoeBuilder => new ShoeBuilder();
