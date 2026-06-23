import { Hand } from '../../engine/hand';
import { Rank, Suit } from '../../engine/types';
import type { RoundState } from '../../engine/round';

const defaultPlayerHands: RoundState['playerHands'] = [
    Hand.of([
        { rank: Rank.Seven, suit: Suit.Spades },
        { rank: Rank.Nine, suit: Suit.Spades },
    ]),
];

const defaultDealerHand: RoundState['dealerHand'] = Hand.of([
    { rank: Rank.Six, suit: Suit.Spades },
    { rank: Rank.King, suit: Suit.Spades },
]);

class RoundStateBuilder {
    private state: RoundState;

    constructor(overrides: Partial<RoundState> = {}) {
        this.state = {
            phase: overrides.phase ?? 'player-action',
            shoe: overrides.shoe ?? { cards: [], dealtCount: 0 },
            playerHands: overrides.playerHands ?? defaultPlayerHands,
            dealerHand: overrides.dealerHand ?? defaultDealerHand,
            holeCardRevealed: overrides.holeCardRevealed ?? false,
            activeHandIndex: overrides.activeHandIndex ?? 0,
            originalBet: overrides.originalBet ?? 50,
            activeBet: overrides.activeBet ?? 50,
            handBets: overrides.handBets ?? [50],
            balance: overrides.balance ?? 500,
            insuranceBet: overrides.insuranceBet,
            insuranceTaken: overrides.insuranceTaken ?? false,
            splitOccurred: overrides.splitOccurred ?? false,
        };
    }

    withPhase(phase: RoundState['phase']): this {
        this.state = { ...this.state, phase };

        return this;
    }

    withPlayerHands(playerHands: RoundState['playerHands']): this {
        this.state = { ...this.state, playerHands };

        return this;
    }

    withDealerHand(dealerHand: RoundState['dealerHand']): this {
        this.state = { ...this.state, dealerHand };

        return this;
    }

    withBalance(balance: number): this {
        this.state = { ...this.state, balance };

        return this;
    }

    withHandBets(handBets: readonly number[]): this {
        this.state = { ...this.state, handBets };

        return this;
    }

    withActiveHandIndex(activeHandIndex: number): this {
        this.state = { ...this.state, activeHandIndex };

        return this;
    }

    withInsuranceTaken(insuranceTaken: boolean): this {
        this.state = { ...this.state, insuranceTaken };

        return this;
    }

    withSplitOccurred(splitOccurred: boolean): this {
        this.state = { ...this.state, splitOccurred };

        return this;
    }

    withHoleCardRevealed(holeCardRevealed: boolean): this {
        this.state = { ...this.state, holeCardRevealed };

        return this;
    }

    build(): RoundState {
        return { ...this.state };
    }
}

export const aRoundState = (...args: ConstructorParameters<typeof RoundStateBuilder>): RoundStateBuilder =>
    new RoundStateBuilder(...args);
