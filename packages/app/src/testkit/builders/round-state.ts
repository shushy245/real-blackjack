import { Hand, Rank, Suit, type RoundState } from '@real-blackjack/common';

class RoundStateBuilder {
    private state: RoundState = {
        phase: 'player-action',
        shoe: { cards: [], dealtCount: 0 },
        playerHands: [
            Hand.of([
                { rank: Rank.Seven, suit: Suit.Spades },
                { rank: Rank.Nine, suit: Suit.Hearts },
            ]),
        ],
        dealerHand: Hand.of([
            { rank: Rank.Six, suit: Suit.Spades },
            { rank: Rank.King, suit: Suit.Hearts },
        ]),
        holeCardRevealed: false,
        activeHandIndex: 0,
        originalBet: 50,
        activeBet: 50,
        handBets: [50],
        balance: 500,
        insuranceBet: undefined,
        insuranceTaken: false,
        splitOccurred: false,
    };

    withPhase(phase: RoundState['phase']): this {
        this.state = { ...this.state, phase };

        return this;
    }

    build(): RoundState {
        return { ...this.state };
    }
}

export const aRoundState = (): RoundStateBuilder => new RoundStateBuilder();
