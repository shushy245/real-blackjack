import { type Card } from './types';
import { createDeck } from './deck';
import { type Rng, shuffle } from './rng';

export type Shoe = {
    readonly cards: readonly Card[];
    readonly dealtCount: number;
};

const DECK_COUNT = 6;
export const RESHUFFLE_THRESHOLD = 234;

export const createShoe = (rng: Rng): Shoe => ({
    cards: shuffle(
        [...Array(DECK_COUNT)].flatMap(() => createDeck()),
        rng,
    ),
    dealtCount: 0,
});

export const dealCard = (shoe: Shoe): [Card, Shoe] => {
    const card = shoe.cards[0];
    if (card === undefined) throw new Error('dealCard: shoe is empty');

    return [card, { cards: shoe.cards.slice(1), dealtCount: shoe.dealtCount + 1 }];
};

export const needsReshuffle = (shoe: Shoe): boolean => shoe.dealtCount >= RESHUFFLE_THRESHOLD;

export const reshuffleShoe = (_shoe: Shoe, rng: Rng): Shoe => createShoe(rng);
