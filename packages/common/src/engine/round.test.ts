import { describe, expect, it } from 'vitest';

import { Hand } from './hand';
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

        const hand0 = round.playerHands[0];
        if (hand0 === undefined) throw new Error('expected hand at index 0');
        expect(hand0.cards).toHaveLength(2);
        expect(round.dealerHand.cards).toHaveLength(2);
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

        const hit0 = next.playerHands[0];
        if (hit0 === undefined) throw new Error('expected hand at index 0');
        expect(hit0.cards).toHaveLength(3);
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
        const firstHand = base.playerHands[0];
        if (firstHand === undefined) throw new Error('expected hand at index 0');
        const twoHand: typeof base = {
            ...base,
            playerHands: [
                firstHand,
                Hand.of([aCard({ rank: Rank.Nine }).build(), aCard({ rank: Rank.Three }).build()]),
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

        const double0 = next.playerHands[0];
        if (double0 === undefined) throw new Error('expected hand at index 0');
        expect(double0.cards).toHaveLength(3);
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

        const split0 = next.playerHands[0];
        const split1 = next.playerHands[1];
        if (split0 === undefined || split1 === undefined) throw new Error('expected two hands after split');
        expect(next.playerHands).toHaveLength(2);
        expect(split0.cards).toHaveLength(2);
        expect(split1.cards).toHaveLength(2);
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

    it('auto-advances past the new active hand when it immediately reaches 21 (e.g. A + King after splitting aces)', () => {
        // Shoe: A♠ 6 A♥ 3 | A♣ 5 | K 7
        // Deal: player=[A♠,A♥] dealer=[6,3] → player-action (no BJ, no Ace up)
        // Split1 (AA): hand0=[A♠,A♣] (pair again), hand1=[A♥,5]
        // Split2 (AA): hand0=[A♠,K]=21 → auto-advance!, hand1=[A♣,7]=18, hand2=[A♥,5]
        const shoe = aShoe([
            aCard({ rank: Rank.Ace, suit: Suit.Spades }).build(),
            aCard({ rank: Rank.Six }).build(),
            aCard({ rank: Rank.Ace, suit: Suit.Hearts }).build(),
            aCard({ rank: Rank.Three }).build(),
            aCard({ rank: Rank.Ace, suit: Suit.Clubs }).build(),
            aCard({ rank: Rank.Five }).build(),
            aCard({ rank: Rank.King }).build(),
            aCard({ rank: Rank.Seven }).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        const afterSplit1 = applyRoundAction(round, { type: Move.Split });
        const afterSplit2 = applyRoundAction(afterSplit1, { type: Move.Split });

        expect(afterSplit2.playerHands).toHaveLength(3);
        expect(afterSplit2.phase).toBe('player-action');
        expect(afterSplit2.activeHandIndex).toBe(1);
    });

    it('advances to dealer-turn when every split hand immediately reaches 21', () => {
        // Shoe: A♠ 6 A♥ 3 | K Q
        // Deal: player=[A♠,A♥] dealer=[6,3] → player-action
        // Split1 (AA): hand0=[A♠,K]=21 → auto-advance, hand1=[A♥,Q]=21 → auto-advance → dealer-turn
        const shoe = aShoe([
            aCard({ rank: Rank.Ace, suit: Suit.Spades }).build(),
            aCard({ rank: Rank.Six }).build(),
            aCard({ rank: Rank.Ace, suit: Suit.Hearts }).build(),
            aCard({ rank: Rank.Three }).build(),
            aCard({ rank: Rank.King }).build(),
            aCard({ rank: Rank.Queen }).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        const afterSplit = applyRoundAction(round, { type: Move.Split });

        expect(afterSplit.playerHands).toHaveLength(2);
        expect(afterSplit.phase).toBe('dealer-turn');
    });

    it('throws when attempting a 5th split', () => {
        const base = actionRound([]);
        const fourHands: typeof base = {
            ...base,
            playerHands: [
                Hand.of([
                    aCard({ rank: Rank.Eight, suit: Suit.Hearts }).build(),
                    aCard({ rank: Rank.Eight, suit: Suit.Spades }).build(),
                ]),
                Hand.of([aCard({ rank: Rank.Eight, suit: Suit.Clubs }).build(), aCard({ rank: Rank.Three }).build()]),
                Hand.of([aCard({ rank: Rank.Eight, suit: Suit.Diamonds }).build(), aCard({ rank: Rank.Five }).build()]),
                Hand.of([aCard({ rank: Rank.Two }).build(), aCard({ rank: Rank.Four }).build()]),
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

    it('declining insurance when player has blackjack and dealer shows Ace but has no BJ: phase → settling immediately', () => {
        // p1=A♠  d1=A♥  p2=K♠  d2=3♠ → player: A+K=BJ | dealer: A(up)+3(hole)=no BJ
        const shoe = aShoe([
            aCard({ rank: Rank.Ace, suit: Suit.Spades }).build(),
            aCard({ rank: Rank.Ace, suit: Suit.Hearts }).build(),
            aCard({ rank: Rank.King }).build(),
            aCard({ rank: Rank.Three }).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        expect(round.phase).toBe('insurance-pending');

        const next = applyRoundAction(round, { type: Move.Stand });

        expect(next.phase).toBe('settling');
        expect(next.holeCardRevealed).toBe(true);
        expect(next.insuranceTaken).toBe(true);
    });

    it('accepting insurance when player has blackjack and dealer shows Ace but has no BJ: phase → settling immediately', () => {
        // p1=A♠  d1=A♥  p2=K♠  d2=3♠ → player: A+K=BJ | dealer: A(up)+3(hole)=no BJ
        const shoe = aShoe([
            aCard({ rank: Rank.Ace, suit: Suit.Spades }).build(),
            aCard({ rank: Rank.Ace, suit: Suit.Hearts }).build(),
            aCard({ rank: Rank.King }).build(),
            aCard({ rank: Rank.Three }).build(),
        ]).build();
        const round = createRound(50, 500, shoe);
        expect(round.phase).toBe('insurance-pending');

        const next = applyRoundAction(round, { type: Move.Insurance });

        expect(next.phase).toBe('settling');
        expect(next.holeCardRevealed).toBe(true);
        expect(next.insuranceTaken).toBe(true);
        expect(next.insuranceBet).toBe(25);
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
