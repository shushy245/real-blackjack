import { describe, expect, it } from 'vitest';

import { createRng } from './rng';
import type { Shoe } from './shoe';
import { createShoe } from './shoe';
import type { Card } from './types';
import { Rank, Suit } from './types';
import { createRound } from './round';

const card = (rank: Rank, suit = Suit.Spades): Card => ({ rank, suit });

const shoeWith = (cards: Card[]): Shoe => ({
    cards: [...cards, ...Array(312 - cards.length).fill(card(Rank.Two))],
    dealtCount: 0,
});

describe('createRound — deal phase', () => {
    it('player has 2 cards and dealer has 2 cards after deal', () => {
        const shoe = createShoe(createRng(42));
        const round = createRound(50, 500, shoe, createRng(42));

        expect(round.playerHands[0]).toHaveLength(2);
        expect(round.dealerCards).toHaveLength(2);
    });

    it('shoe has 4 fewer cards after deal', () => {
        const shoe = createShoe(createRng(42));
        const before = shoe.cards.length;
        const round = createRound(50, 500, shoe, createRng(42));

        expect(round.shoe.cards.length).toBe(before - 4);
    });

    it('hole card is not revealed after deal', () => {
        const shoe = createShoe(createRng(42));
        const round = createRound(50, 500, shoe, createRng(42));

        expect(round.holeCardRevealed).toBe(false);
    });

    it('phase is player-action when neither player nor dealer has blackjack', () => {
        // 7♠ 6♠ 9♠ K♠ → player: 7,9 (16) | dealer: 6,K (16) — no BJ
        const shoe = shoeWith([card(Rank.Seven), card(Rank.Six), card(Rank.Nine), card(Rank.King)]);
        const round = createRound(50, 500, shoe, createRng(42));

        expect(round.phase).toBe('player-action');
    });

    it('phase is settling when player has blackjack and dealer up card is not Ace or 10-value', () => {
        // A♠ 6♠ K♠ 9♠ → player: A,K (BJ) | dealer up: 6 — peek finds no BJ → settle
        const shoe = shoeWith([card(Rank.Ace), card(Rank.Six), card(Rank.King), card(Rank.Nine)]);
        const round = createRound(50, 500, shoe, createRng(42));

        expect(round.phase).toBe('settling');
    });

    it('phase is insurance-pending when player has blackjack and dealer shows Ace', () => {
        // A♠ A♥ K♠ 9♠ → player: A,K (BJ) | dealer up: A — offer insurance
        const shoe = shoeWith([
            card(Rank.Ace, Suit.Spades),
            card(Rank.Ace, Suit.Hearts),
            card(Rank.King),
            card(Rank.Nine),
        ]);
        const round = createRound(50, 500, shoe, createRng(42));

        expect(round.phase).toBe('insurance-pending');
    });

    it('phase is settling when dealer has blackjack and up card is not Ace (peek reveals BJ)', () => {
        // 7♠ K♠ 9♠ A♠ → player: 7,9 (16) | dealer: K(up),A(hole) — peek finds BJ → settle
        const shoe = shoeWith([card(Rank.Seven), card(Rank.King), card(Rank.Nine), card(Rank.Ace)]);
        const round = createRound(50, 500, shoe, createRng(42));

        expect(round.phase).toBe('settling');
    });
});
