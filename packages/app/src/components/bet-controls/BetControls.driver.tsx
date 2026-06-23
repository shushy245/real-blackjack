import { fireEvent, render, screen } from '@testing-library/react-native';

import { BetControls } from './BetControls';
import { BetControlsTestIds, type ChipDenomination } from './BetControls.utils';

class BetControlsDriver {
    private _balance = 500;
    private _minBet = 10;
    private _lastBet = 0;
    private _handlePlaceBet = jest.fn();

    given = {
        balance: (v: number): void => {
            this._balance = v;
        },
        minBet: (v: number): void => {
            this._minBet = v;
        },
        lastBet: (v: number): void => {
            this._lastBet = v;
        },
        onPlaceBet: (fn: jest.Mock): void => {
            this._handlePlaceBet = fn;
        },
    };

    when = {
        created: (): void => {
            const handlePlaceBet = this._handlePlaceBet;
            render(
                <BetControls
                    balance={this._balance}
                    minBet={this._minBet}
                    lastBet={this._lastBet}
                    onPlaceBet={handlePlaceBet}
                />,
            );
        },
    };

    click = {
        chip: (denom: ChipDenomination): void => {
            fireEvent.press(screen.getByTestId(BetControlsTestIds.ChipButton(denom)));
        },
        clear: (): void => {
            fireEvent.press(screen.getByTestId(BetControlsTestIds.ClearButton));
        },
        repeat: (): void => {
            fireEvent.press(screen.getByTestId(BetControlsTestIds.RepeatButton));
        },
        deal: (): void => {
            fireEvent.press(screen.getByTestId(BetControlsTestIds.DealButton));
        },
    };

    assert = {
        betCounter: (expected: string): void => {
            expect(screen.getByTestId(BetControlsTestIds.BetCounter)).toHaveTextContent(expected);
        },
        dealEnabled: (): void => {
            expect(screen.getByTestId(BetControlsTestIds.DealButton)).not.toBeDisabled();
        },
        dealDisabled: (): void => {
            expect(screen.getByTestId(BetControlsTestIds.DealButton)).toBeDisabled();
        },
        repeatEnabled: (): void => {
            expect(screen.getByTestId(BetControlsTestIds.RepeatButton)).not.toBeDisabled();
        },
        repeatDisabled: (): void => {
            expect(screen.getByTestId(BetControlsTestIds.RepeatButton)).toBeDisabled();
        },
        chipEnabled: (denom: ChipDenomination): void => {
            expect(screen.getByTestId(BetControlsTestIds.ChipButton(denom))).not.toBeDisabled();
        },
        chipDisabled: (denom: ChipDenomination): void => {
            expect(screen.getByTestId(BetControlsTestIds.ChipButton(denom))).toBeDisabled();
        },
        onPlaceCalledWith: (amount: number): void => {
            expect(this._handlePlaceBet).toHaveBeenCalledWith(amount);
        },
        onPlaceNotCalled: (): void => {
            expect(this._handlePlaceBet).not.toHaveBeenCalled();
        },
    };
}

export const makeBetControlsDriver = (): BetControlsDriver => new BetControlsDriver();

describe('BetControls driver module', () => {
    it('exports the driver factory', () => {
        expect(makeBetControlsDriver).toBeDefined();
    });
});
