import type { Hand } from '@real-blackjack/common';
import { act, render } from '@testing-library/react-native';

import { aHand } from '~/testkit/builders';

import { DealerHand } from './DealerHand';
import { DEALER_CARD_DELAY_MS } from '../../animations/constants';

jest.mock('~/sounds', () => ({
    useSoundEffects: (): object => ({
        deal: jest.fn(),
        flip: jest.fn(),
        chip: jest.fn(),
        win: jest.fn(),
        bust: jest.fn(),
    }),
}));

class DealerHandDriver {
    private _hand: Hand = aHand().build();
    private _holeRevealed = false;
    private _onAllCardsVisible = jest.fn();

    given = {
        hand: (hand: Hand): void => {
            this._hand = hand;
        },
        holeRevealed: (v: boolean): void => {
            this._holeRevealed = v;
        },
    };

    when = {
        created: (): void => {
            const { hand, holeRevealed, onAllCardsVisible } = this;
            render(<DealerHand hand={hand} holeRevealed={holeRevealed} onAllCardsVisible={onAllCardsVisible} />);
        },
        allCardsRevealedWithTime: async (): Promise<void> => {
            await act(async () => {
                jest.advanceTimersByTime(1);
            });
            await act(async () => {
                jest.advanceTimersByTime(DEALER_CARD_DELAY_MS);
            });
        },
    };

    assert = {
        onAllCardsVisibleCalled: (): void => {
            expect(this._onAllCardsVisible).toHaveBeenCalled();
        },
        onAllCardsVisibleNotCalled: (): void => {
            expect(this._onAllCardsVisible).not.toHaveBeenCalled();
        },
    };

    private get hand(): Hand {
        return this._hand;
    }
    private get holeRevealed(): boolean {
        return this._holeRevealed;
    }
    private get onAllCardsVisible(): () => void {
        return this._onAllCardsVisible;
    }
}

export const makeDealerHandDriver = (): DealerHandDriver => new DealerHandDriver();

describe('DealerHand driver module', () => {
    it('exports the driver factory', () => {
        expect(makeDealerHandDriver).toBeDefined();
    });
});
