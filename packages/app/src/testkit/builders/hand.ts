import { Hand, Rank, Suit, type Card } from '@real-blackjack/common';

class HandBuilder {
    private _cards: Card[] = [
        { rank: Rank.Seven, suit: Suit.Spades },
        { rank: Rank.Nine, suit: Suit.Hearts },
    ];

    withCards(cards: Card[]): this {
        this._cards = [...cards];

        return this;
    }

    build(): Hand {
        return Hand.of(this._cards);
    }
}

export const aHand = (): HandBuilder => new HandBuilder();
