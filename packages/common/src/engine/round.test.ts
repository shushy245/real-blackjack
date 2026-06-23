import { describe, expect, it } from 'vitest';

import { createRng } from './rng';
import { createShoe } from './shoe';
import type { Card } from './types';
import { Move, Rank, Suit } from './types';
import { aCard, aShoe } from '../testkit/builders';
import { applyRoundAction, createRound } from './round';

// first 4 cards: player gets 7,9 (hard 16); dealer gets 6 (up), K (hole) — no BJ, player-action
const actionRound = (extraCards: Card[], balance = 500, bet = 50) => {
    const shoe = aShoe([
        aCard({ rank: Rank.Seven }).build(),
        aCard({ rank: Rank.Six }).build(),
        aCard({ rank: Rank.Nine }).build(),
        aCard({ rank: Rank.King }).build(),
        ...extraCards,
    ]).build();

    return createRound(bet, balance, shoe);
};

describe('createRound — deal phase', () => {
    it('player has 2 cards and dealer has 2 cards after deal', () => {
        const shoe = createShoe(createRng(42));
        const round = createRound(50, 500, shoe);

        expect(round.playerHands[0]).toHaveLength(2);
        expect(round.dealerCards).toHaveLength(2);
    });

    it('shoe has 4 fewer cards after deal', () => {
        const shoe = createShoe(createRng(42));
        const before = shoe.cards.length;
        const round = createRound(50, 500, shoe);

        expect(round.shoe.cards.length).toBe(before - 4);
    });

    it('hole card is not revealed after deal', () => {
        const shoe = createShoe(createRng(42));
        const round = createRound(50, 500, shoe);

        expect(round.holeCardRevealed).toBe(false);
    });

    it('phase is player-action when neither player nor dealer has blackjack', () => {
        // 7♠ 6♠ 9♠ K♠ → player: 7,9 (16) | dealer: 6,K (16) — no BJ
        const shoe = aShoe([
            aCard({ rank: Rank.Seven }).build(),
            aCard({ rank: Rank.Six }).build(),
            aCard({ rank: Rank.Nine }).build(),
            aCard({ rank: Rank.King }).build(),
        ]).build();
        const round = createRound(50, 500, shoe);

        expect(round.phase).toBe('player-action');
    });

    it('phase is settling when player has blackjack and dealer up card is not Ace or 10-value', () => {
        // A♠ 6♠ K♠ 9♠ → player: A,K (BJ) | dealer up: 6 — peek finds no BJ → settle
        const shoe = aShoe([
            aCard({ rank: Rank.Ace }).build(),
            aCard({ rank: Rank.Six }).build(),
            aCard({ rank: Rank.King }).build(),
            aCard({ rank: Rank.Nine }).build(),
        ]).build();
        const round = createRound(50, 500, shoe);

        expect(round.phase).toBe('settling');
    });

    it('hole card is revealed when player has blackjack and round goes directly to settling', () => {
        // A♠ 6♠ K♠ 9♠ → player: A,K (BJ) | dealer up: 6 — holeCard must be face-up at settlement
        const shoe = aShoe([
            aCard({ rank: Rank.Ace }).build(),
            aCard({ rank: Rank.Six }).build(),
            aCard({ rank: Rank.King }).build(),
            aCard({ rank: Rank.Nine }).build(),
        ]).build();
        const round = createRound(50, 500, shoe);

        expect(round.holeCardRevealed).toBe(true);
    });

    it('phase is insurance-pending when player has blackjack and dealer shows Ace', () => {
        // A♠ A♥ K♠ 9♠ → player: A,K (BJ) | dealer up: A — offer insurance
        const shoe = aShoe([
            aCard({ rank: Rank.Ace, suit: Suit.Spades }).build(),
            aCard({ rank: Rank.Ace, suit: Suit.Hearts }).build(),
            aCard({ rank: Rank.King }).build(),
            aCard({ rank: Rank.Nine }).build(),
        ]).build();
        const round = createRound(50, 500, shoe);

        expect(round.phase).toBe('insurance-pending');
    });

    it('phase is settling when dealer has blackjack and up card is not Ace (peek reveals BJ)', () => {
        // 7♠ K♠ 9♠ A♠ → player: 7,9 (16) | dealer: K(up),A(hole) — peek finds BJ → settle
        const shoe = aShoe([
            aCard({ rank: Rank.Seven }).build(),
            aCard({ rank: Rank.King }).build(),
            aCard({ rank: Rank.Nine }).build(),
            aCard({ rank: Rank.Ace }).build(),
        ]).build();
        const round = createRound(50, 500, shoe);

        expect(round.phase).toBe('settling');
    });

    it('phase is insurance-pending when dealer shows Ace and has BJ in hole (insurance offered first)', () => {
        // 7♠ A♥ 9♠ K♠ → player: 7,9 (16) | dealer: A(up),K(hole)=BJ — must offer insurance first
        const shoe = aShoe([
            aCard({ rank: Rank.Seven }).build(),
            aCard({ rank: Rank.Ace }).build(),
            aCard({ rank: Rank.Nine }).build(),
            aCard({ rank: Rank.King }).build(),
        ]).build();
        const round = createRound(50, 500, shoe);

        expect(round.phase).toBe('insurance-pending');
        expect(round.holeCardRevealed).toBe(false);
    });
});

describe('applyRoundAction — Hit', () => {
    it('adds a card to the active hand', () => {
        const round = actionRound([aCard({ rank: Rank.Three }).build()]);
        const next = applyRoundAction(round, { type: Move.Hit });

        expect(next.playerHands[0]).toHaveLength(3);
    });

    it('busting the only hand moves to dealer-turn', () => {
        // player has 7,9 (16); hit a King → 26 → bust
        const round = actionRound([aCard({ rank: Rank.King }).build()]);
        const next = applyRoundAction(round, { type: Move.Hit });

        expect(next.phase).toBe('dealer-turn');
    });

    it('reaching exactly 21 auto-stands and moves to dealer-turn (single hand)', () => {
        // player has 7,9 (16); hit a Five → 21 → auto-stand
        const round = actionRound([aCard({ rank: Rank.Five }).build()]);
        const next = applyRoundAction(round, { type: Move.Hit });

        expect(next.phase).toBe('dealer-turn');
    });

    it('non-bust hit on single hand stays in player-action', () => {
        const round = actionRound([aCard({ rank: Rank.Three }).build()]);
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
        const base = actionRound([aCard({ rank: Rank.Three }).build()]);
        const twoHand: typeof base = {
            ...base,
            playerHands: [
                base.playerHands[0] ?? [],
                [aCard({ rank: Rank.Nine }).build(), aCard({ rank: Rank.Three }).build()],
            ],
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
        const round = actionRound([aCard({ rank: Rank.Three }).build()]);
        const next = applyRoundAction(round, { type: Move.Double });

        expect(next.activeBet).toBe(100);
        expect(next.balance).toBe(450);
    });

    it('deals exactly one card then auto-stands', () => {
        const round = actionRound([aCard({ rank: Rank.Three }).build()]);
        const next = applyRoundAction(round, { type: Move.Double });

        expect(next.playerHands[0]).toHaveLength(3);
        expect(next.phase).toBe('dealer-turn');
    });
});

describe('applyRoundAction — Split', () => {
    it('creates two hands from a pair', () => {
        // player starts with 8,8 (pair)
        const shoe = aShoe([
            aCard({ rank: Rank.Eight, suit: Suit.Hearts }).build(),
            aCard({ rank: Rank.Six }).build(),
            aCard({ rank: Rank.Eight, suit: Suit.Spades }).build(),
            aCard({ rank: Rank.King }).build(),
            aCard({ rank: Rank.Three }).build(),
            aCard({ rank: Rank.Four }).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        const next = applyRoundAction(round, { type: Move.Split });

        expect(next.playerHands).toHaveLength(2);
        expect(next.playerHands[0]).toHaveLength(2);
        expect(next.playerHands[1]).toHaveLength(2);
        expect(next.activeHandIndex).toBe(0);
    });

    it('deducts originalBet from balance', () => {
        const shoe = aShoe([
            aCard({ rank: Rank.Eight, suit: Suit.Hearts }).build(),
            aCard({ rank: Rank.Six }).build(),
            aCard({ rank: Rank.Eight, suit: Suit.Spades }).build(),
            aCard({ rank: Rank.King }).build(),
            aCard({ rank: Rank.Three }).build(),
            aCard({ rank: Rank.Four }).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        const next = applyRoundAction(round, { type: Move.Split });

        expect(next.balance).toBe(450); // 500 - 50 (originalBet for second hand)
    });

    it('throws when attempting a 5th split', () => {
        const base = actionRound([]);
        const fourHands: typeof base = {
            ...base,
            playerHands: [
                [
                    aCard({ rank: Rank.Eight, suit: Suit.Hearts }).build(),
                    aCard({ rank: Rank.Eight, suit: Suit.Spades }).build(),
                ],
                [aCard({ rank: Rank.Eight, suit: Suit.Clubs }).build(), aCard({ rank: Rank.Three }).build()],
                [aCard({ rank: Rank.Eight, suit: Suit.Diamonds }).build(), aCard({ rank: Rank.Five }).build()],
                [aCard({ rank: Rank.Two }).build(), aCard({ rank: Rank.Four }).build()],
            ],
            handBets: [50, 50, 50, 50],
        };

        expect(() => applyRoundAction(fourHands, { type: Move.Split })).toThrow();
    });
});

describe('applyRoundAction — Insurance', () => {
    it('accepted: deducts half bet from balance, sets insuranceBet, marks taken, moves to player-action', () => {
        const shoe = aShoe([
            aCard({ rank: Rank.Seven }).build(),
            aCard({ rank: Rank.Ace }).build(),
            aCard({ rank: Rank.Nine }).build(),
            aCard({ rank: Rank.Three }).build(),
        ]).build();
        const round = createRound(50, 500, shoe);

        expect(round.phase).toBe('insurance-pending');
        const next = applyRoundAction(round, { type: Move.Insurance });

        expect(next.insuranceBet).toBe(25);
        expect(next.balance).toBe(475);
        expect(next.insuranceTaken).toBe(true);
        expect(next.phase).toBe('player-action');
    });

    it('declined (Stand as decline): insuranceTaken set true (prevents re-offer), no insuranceBet, phase → player-action', () => {
        const shoe = aShoe([
            aCard({ rank: Rank.Seven }).build(),
            aCard({ rank: Rank.Ace }).build(),
            aCard({ rank: Rank.Nine }).build(),
            aCard({ rank: Rank.Three }).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        const next = applyRoundAction(round, { type: Move.Stand });

        expect(next.insuranceTaken).toBe(true);
        expect(next.insuranceBet).toBeUndefined();
        expect(next.phase).toBe('player-action');
    });

    it('accepting insurance when dealer has BJ: phase → settling with hole revealed', () => {
        // dealer A(up)+K(hole)=BJ; player takes insurance → immediate settle
        const shoe = aShoe([
            aCard({ rank: Rank.Seven }).build(),
            aCard({ rank: Rank.Ace }).build(),
            aCard({ rank: Rank.Nine }).build(),
            aCard({ rank: Rank.King }).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        expect(round.phase).toBe('insurance-pending');
        const next = applyRoundAction(round, { type: Move.Insurance });

        expect(next.phase).toBe('settling');
        expect(next.holeCardRevealed).toBe(true);
        expect(next.insuranceTaken).toBe(true);
        expect(next.insuranceBet).toBe(25);
    });

    it('declining insurance when dealer has BJ: phase → settling with hole revealed, insuranceTaken true, no insuranceBet', () => {
        const shoe = aShoe([
            aCard({ rank: Rank.Seven }).build(),
            aCard({ rank: Rank.Ace }).build(),
            aCard({ rank: Rank.Nine }).build(),
            aCard({ rank: Rank.King }).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        const next = applyRoundAction(round, { type: Move.Stand });

        expect(next.phase).toBe('settling');
        expect(next.holeCardRevealed).toBe(true);
        expect(next.insuranceTaken).toBe(true);
        expect(next.insuranceBet).toBeUndefined();
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
