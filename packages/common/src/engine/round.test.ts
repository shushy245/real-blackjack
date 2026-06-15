import { describe, expect, it } from 'vitest';

import { createRng } from './rng';
import type { Shoe } from './shoe';
import { createShoe } from './shoe';
import type { Card } from './types';
import { Move, Rank, Suit } from './types';
import { applyRoundAction, createRound } from './round';

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

    it('hole card is revealed when player has blackjack and round goes directly to settling', () => {
        // A♠ 6♠ K♠ 9♠ → player: A,K (BJ) | dealer up: 6 — holeCard must be face-up at settlement
        const shoe = shoeWith([card(Rank.Ace), card(Rank.Six), card(Rank.King), card(Rank.Nine)]);
        const round = createRound(50, 500, shoe, createRng(42));

        expect(round.holeCardRevealed).toBe(true);
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

// Helper: build a player-action round with controlled shoe cards after the initial 4-card deal
const actionRound = (extraCards: Card[], balance = 500, bet = 50) => {
    // first 4 cards: player gets 7,9 (hard 16); dealer gets 6 (up), K (hole) — no BJ, player-action
    const shoe = shoeWith([card(Rank.Seven), card(Rank.Six), card(Rank.Nine), card(Rank.King), ...extraCards]);

    return createRound(bet, balance, shoe, createRng(42));
};

describe('applyRoundAction — Hit', () => {
    it('adds a card to the active hand', () => {
        const round = actionRound([card(Rank.Three)]);
        const next = applyRoundAction(round, { type: Move.Hit });

        expect(next.playerHands[0]).toHaveLength(3);
    });

    it('busting the only hand moves to dealer-turn', () => {
        // player has 7,9 (16); hit a King → 26 → bust
        const round = actionRound([card(Rank.King)]);
        const next = applyRoundAction(round, { type: Move.Hit });

        expect(next.phase).toBe('dealer-turn');
    });

    it('reaching exactly 21 auto-stands and moves to dealer-turn (single hand)', () => {
        // player has 7,9 (16); hit a Five → 21 → auto-stand
        const round = actionRound([card(Rank.Five)]);
        const next = applyRoundAction(round, { type: Move.Hit });

        expect(next.phase).toBe('dealer-turn');
    });

    it('non-bust hit on single hand stays in player-action', () => {
        const round = actionRound([card(Rank.Three)]);
        const next = applyRoundAction(round, { type: Move.Hit });

        expect(next.phase).toBe('player-action');
    });
});

describe('applyRoundAction — Stand', () => {
    it('advances to dealer-turn on single hand', () => {
        const round = actionRound([]);
        const next = applyRoundAction(round, { type: Move.Stand });

        expect(next.phase).toBe('dealer-turn');
    });

    it('advances activeHandIndex when more hands remain', () => {
        // two-hand split scenario: start with activeHandIndex 0, two hands present
        const base = actionRound([card(Rank.Three)]);
        const twoHand: typeof base = {
            ...base,
            playerHands: [base.playerHands[0] ?? [], [card(Rank.Nine), card(Rank.Three)]],
            handBets: [50, 50],
            activeHandIndex: 0,
        };
        const next = applyRoundAction(twoHand, { type: Move.Stand });

        expect(next.activeHandIndex).toBe(1);
        expect(next.phase).toBe('player-action');
    });
});

describe('applyRoundAction — Double', () => {
    it('doubles activeBet and deducts from balance', () => {
        const round = actionRound([card(Rank.Three)]);
        const next = applyRoundAction(round, { type: Move.Double });

        expect(next.activeBet).toBe(100);
        expect(next.balance).toBe(450);
    });

    it('deals exactly one card then auto-stands', () => {
        const round = actionRound([card(Rank.Three)]);
        const next = applyRoundAction(round, { type: Move.Double });

        expect(next.playerHands[0]).toHaveLength(3);
        expect(next.phase).toBe('dealer-turn');
    });
});

describe('applyRoundAction — Split', () => {
    it('creates two hands from a pair', () => {
        // player starts with 8,8 (pair)
        const shoe = shoeWith([
            card(Rank.Eight, Suit.Hearts),
            card(Rank.Six),
            card(Rank.Eight, Suit.Spades),
            card(Rank.King),
            card(Rank.Three), // card dealt to first split hand
            card(Rank.Four), // card dealt to second split hand
        ]);
        const round = createRound(50, 500, shoe, createRng(42));
        const next = applyRoundAction(round, { type: Move.Split });

        expect(next.playerHands).toHaveLength(2);
        expect(next.playerHands[0]).toHaveLength(2);
        expect(next.playerHands[1]).toHaveLength(2);
        expect(next.activeHandIndex).toBe(0);
    });

    it('throws when attempting a 5th split', () => {
        const base = actionRound([]);
        const fourHands: typeof base = {
            ...base,
            playerHands: [
                [card(Rank.Eight, Suit.Hearts), card(Rank.Eight, Suit.Spades)],
                [card(Rank.Eight, Suit.Clubs), card(Rank.Three)],
                [card(Rank.Eight, Suit.Diamonds), card(Rank.Five)],
                [card(Rank.Two), card(Rank.Four)],
            ],
            handBets: [50, 50, 50, 50],
        };

        expect(() => applyRoundAction(fourHands, { type: Move.Split })).toThrow();
    });
});

describe('applyRoundAction — Insurance', () => {
    it('accepted: deducts half bet from balance, sets insuranceBet, marks taken, moves to player-action', () => {
        const shoe = shoeWith([card(Rank.Seven), card(Rank.Ace), card(Rank.Nine), card(Rank.Three)]);
        const round = createRound(50, 500, shoe, createRng(42));

        expect(round.phase).toBe('insurance-pending');
        const next = applyRoundAction(round, { type: Move.Insurance });

        expect(next.insuranceBet).toBe(25);
        expect(next.balance).toBe(475);
        expect(next.insuranceTaken).toBe(true);
        expect(next.phase).toBe('player-action');
    });

    it('declined (Stand as decline): marks insuranceTaken, moves to player-action', () => {
        const shoe = shoeWith([card(Rank.Seven), card(Rank.Ace), card(Rank.Nine), card(Rank.Three)]);
        const round = createRound(50, 500, shoe, createRng(42));
        const next = applyRoundAction(round, { type: Move.Stand });

        expect(next.insuranceTaken).toBe(true);
        expect(next.insuranceBet).toBeUndefined();
        expect(next.phase).toBe('player-action');
    });
});

describe('applyRoundAction — illegal moves', () => {
    it('throws a descriptive error for an illegal move in the current phase', () => {
        const round = actionRound([]);

        expect(() => applyRoundAction(round, { type: Move.Insurance })).toThrow(
            'applyRoundAction: Insurance is not legal in phase player-action',
        );
    });
});
