import { aCard } from './card';
import { Hand } from '../../engine/hand';
import { Rank, type Card } from '../../engine/types';

class HandBuilder {
    private state: Card[] = [aCard().withRank(Rank.Seven).build(), aCard().withRank(Rank.Nine).build()];

    withCards(cards: readonly Card[]): this {
        this.state = [...cards];

        return this;
    }

    withRanks(ranks: readonly Rank[]): this {
        this.state = ranks.map((rank) => aCard().withRank(rank).build());

        return this;
    }

    build(): Hand {
        return Hand.of(this.state);
    }
}

export const aHand = (): HandBuilder => new HandBuilder();
