import { describe, expect, it } from 'vitest';

import type { Shoe } from './shoe';
import type { Card } from './types';
import { settleRound } from './payouts';
import type { RoundState } from './round';
import { Move, Rank, Suit } from './types';
import { applyRoundAction, createRound, runDealerTurn } from './round';

const card = (rank: Rank, suit = Suit.Spades): Card => ({ rank, suit });

const shoeWith = (cards: Card[]): Shoe => ({
    cards: [...cards, ...Array(312 - cards.length).fill(card(Rank.Two))],
    dealtCount: 0,
});

// deal phase: p1, d-up, p2, d-hole, then extra cards
const dealerTurnRound = (playerCards: [Card, Card], dealerUp: Card, dealerHole: Card, extraCards: Card[]) => {
    const shoe = shoeWith([playerCards[0], dealerUp, playerCards[1], dealerHole, ...extraCards]);

    return createRound(50, 500, shoe);
};

describe('runDealerTurn', () => {
    it('reveals hole card at start of dealer turn', () => {
        // player: 7+K=17, dealer: 6+K=16 → player stands → dealer turn
        const round = dealerTurnRound([card(Rank.Seven), card(Rank.King)], card(Rank.Six), card(Rank.King), []);
        const stood = applyRoundAction(round, { type: Move.Stand });
        const dealerRound = runDealerTurn(stood);

        expect(dealerRound.holeCardRevealed).toBe(true);
    });

    it('dealer draws cards until shouldDealerHit is false', () => {
        // player: 7+K=17 (stands), dealer: 6+K=16 → dealer must hit → gets Two → 18 → stop
        const round = dealerTurnRound([card(Rank.Seven), card(Rank.King)], card(Rank.Six), card(Rank.King), [
            card(Rank.Two),
        ]);
        const stood = applyRoundAction(round, { type: Move.Stand });
        const dealerRound = runDealerTurn(stood);

        expect(dealerRound.dealerCards).toHaveLength(3);
        expect(dealerRound.phase).toBe('settling');
    });

    it('dealer stops on hard 17', () => {
        // dealer: 7+K=17 → stands immediately
        const round = dealerTurnRound([card(Rank.Three), card(Rank.King)], card(Rank.Seven), card(Rank.King), []);
        const stood = applyRoundAction(round, { type: Move.Stand });
        const dealerRound = runDealerTurn(stood);

        expect(dealerRound.dealerCards).toHaveLength(2);
    });

    it('dealer stops on soft 18+', () => {
        // dealer: A+7 = soft 18 → stands
        const round = dealerTurnRound([card(Rank.Three), card(Rank.King)], card(Rank.Ace), card(Rank.Seven), []);
        // dealer up is Ace → insurance-pending; decline insurance to get to player-action
        const declined = applyRoundAction(round, { type: Move.Stand });
        const stood = applyRoundAction(declined, { type: Move.Stand });
        const dealerRound = runDealerTurn(stood);

        expect(dealerRound.dealerCards).toHaveLength(2);
    });

    it('dealer does not draw additional cards after busting', () => {
        // dealer: 6+K=16 → hits → gets King → 26 (bust)
        const round = dealerTurnRound([card(Rank.Three), card(Rank.King)], card(Rank.Six), card(Rank.King), [
            card(Rank.King),
        ]);
        const stood = applyRoundAction(round, { type: Move.Stand });
        const dealerRound = runDealerTurn(stood);

        expect(dealerRound.dealerCards).toHaveLength(3);
        expect(dealerRound.phase).toBe('settling');
    });
});

describe('settleRound', () => {
    it('player bust → loss regardless of dealer result', () => {
        // player: 7+9=16, hits King → bust; dealer: 6+K=16
        const shoe = shoeWith([card(Rank.Seven), card(Rank.Six), card(Rank.Nine), card(Rank.King), card(Rank.King)]);
        const round = createRound(50, 500, shoe);
        const hit = applyRoundAction(round, { type: Move.Hit });
        const settled = runDealerTurn(hit);
        const { netDelta, handResults } = settleRound(settled);

        expect(handResults[0]?.outcome).toBe('lose');
        expect(netDelta).toBeLessThan(0);
    });

    it('dealer bust, player not bust → player wins 1:1', () => {
        // player: 7+K=17 (stand), dealer: 6+K=16, hits King → bust
        const shoe = shoeWith([card(Rank.Seven), card(Rank.Six), card(Rank.King), card(Rank.King), card(Rank.King)]);
        const round = createRound(50, 500, shoe);
        const stood = applyRoundAction(round, { type: Move.Stand });
        const settled = runDealerTurn(stood);
        const { netDelta, handResults } = settleRound(settled);

        expect(handResults[0]?.outcome).toBe('win');
        expect(netDelta).toBe(50);
    });

    it('player higher total → win 1:1', () => {
        // player: 8+K=18, dealer: 6+K=16, hits Two → 18 ... wait need higher
        // player: 9+K=19 (stand), dealer: 6+K=16, hits Two → 18 → stand
        const shoe = shoeWith([card(Rank.Nine), card(Rank.Six), card(Rank.King), card(Rank.King), card(Rank.Two)]);
        const round = createRound(50, 500, shoe);
        const stood = applyRoundAction(round, { type: Move.Stand });
        const settled = runDealerTurn(stood);
        const { netDelta, handResults } = settleRound(settled);

        expect(handResults[0]?.outcome).toBe('win');
        expect(netDelta).toBe(50);
    });

    it('equal totals (non-BJ) → push', () => {
        // player: 7+K=17 (stand), dealer: 7+K=17 → stand immediately
        const shoe = shoeWith([card(Rank.Seven), card(Rank.Seven), card(Rank.King), card(Rank.King)]);
        const round = createRound(50, 500, shoe);
        const stood = applyRoundAction(round, { type: Move.Stand });
        const settled = runDealerTurn(stood);
        const { netDelta, handResults } = settleRound(settled);

        expect(handResults[0]?.outcome).toBe('push');
        expect(netDelta).toBe(0);
    });

    it('player BJ, dealer not BJ → win 3:2', () => {
        // player: A+K=BJ, dealer: 6+9 (no BJ) → settling immediately
        const shoe = shoeWith([card(Rank.Ace), card(Rank.Six), card(Rank.King), card(Rank.Nine)]);
        const round = createRound(50, 500, shoe);
        // round is already 'settling' due to player BJ
        const { netDelta, handResults } = settleRound(round);

        expect(handResults[0]?.outcome).toBe('blackjack');
        expect(netDelta).toBe(75); // 3:2 on 50 = 75
    });

    it('player BJ, dealer BJ → push', () => {
        // player: A♠+K, dealer: A♥(up)+K(hole) → dealer peek finds BJ → settling
        const shoe = shoeWith([
            card(Rank.Ace, Suit.Spades),
            card(Rank.Ace, Suit.Hearts),
            card(Rank.King, Suit.Spades),
            card(Rank.King, Suit.Hearts),
        ]);
        const round = createRound(50, 500, shoe);
        const { netDelta, handResults } = settleRound(round);

        expect(handResults[0]?.outcome).toBe('push');
        expect(netDelta).toBe(0);
    });

    it('insurance taken + dealer BJ → netDelta is 0 (insurance profit covers main bet loss)', () => {
        // player: 7+9=16, dealer: A(up)+K(hole)=BJ → insurance-pending first
        const shoe = shoeWith([card(Rank.Seven), card(Rank.Ace), card(Rank.Nine), card(Rank.King)]);
        const round = createRound(50, 500, shoe);
        expect(round.phase).toBe('insurance-pending');
        const accepted = applyRoundAction(round, { type: Move.Insurance });
        expect(accepted.phase).toBe('settling');
        const { netDelta } = settleRound(accepted);

        // insurance wins 2:1 on 25 = +50; main bet loses (-50) → net 0
        expect(netDelta).toBe(0);
    });

    it('insurance declined + dealer BJ → player loses main bet (no free push)', () => {
        const shoe = shoeWith([card(Rank.Seven), card(Rank.Ace), card(Rank.Nine), card(Rank.King)]);
        const round = createRound(50, 500, shoe);
        const declined = applyRoundAction(round, { type: Move.Stand });
        expect(declined.phase).toBe('settling');
        const { netDelta } = settleRound(declined);

        expect(netDelta).toBe(-50);
    });

    it('split hand with natural 21 (Ace + ten-value) pays 1:1, not 3:2', () => {
        // Synthetic split round: two hands, hand[0] = [Ace, King] = 21 (looks like BJ)
        // Standard rule: split-hand natural 21 is a regular win, not blackjack
        const splitRound: RoundState = {
            phase: 'settling' as const,
            shoe: { cards: [], dealtCount: 0 },
            playerHands: [
                [card(Rank.Ace), card(Rank.King)],
                [card(Rank.Eight), card(Rank.Nine)],
            ],
            dealerCards: [card(Rank.Six), card(Rank.Ten)],
            holeCardRevealed: true,
            activeHandIndex: 1,
            originalBet: 50,
            activeBet: 50,
            handBets: [50, 50],
            balance: 450,
            insuranceBet: undefined,
            insuranceTaken: false,
        };
        const { handResults } = settleRound(splitRound);

        expect(handResults[0]?.outcome).toBe('win'); // not 'blackjack'
        expect(handResults[0]?.payout).toBe(50); // 1:1, not 75 (3:2)
    });

    it('insurance + dealer no BJ → insurance lost; original bet settles normally', () => {
        // player: 7+9=16, dealer: A(up)+3(hole)=no BJ; player stands → dealer draws to 17+
        const shoe = shoeWith([
            card(Rank.Seven),
            card(Rank.Ace),
            card(Rank.Nine),
            card(Rank.Three),
            card(Rank.Four), // dealer draws: A+3+4=8... wait A=11+3+4=18, stands
        ]);
        const round = createRound(50, 500, shoe);
        // dealer shows Ace, no BJ → insurance-pending
        expect(round.phase).toBe('insurance-pending');
        const accepted = applyRoundAction(round, { type: Move.Insurance });
        const stood = applyRoundAction(accepted, { type: Move.Stand });
        const settled = runDealerTurn(stood);
        const { netDelta } = settleRound(settled);

        // player 16 loses to dealer 18; insurance lost (-25); net = -50 (bet) - 25 (insurance) = -75
        expect(netDelta).toBe(-75);
    });
});
