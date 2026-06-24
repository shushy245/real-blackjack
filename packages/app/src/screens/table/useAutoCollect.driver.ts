import type { RoundState } from '@real-blackjack/common';
import { act, renderHook } from '@testing-library/react-native';

import { AUTO_COLLECT_DELAY_MS } from '~/animations/constants';

import { useAutoCollect } from './useAutoCollect';

class UseAutoCollectDriver {
    private _round: RoundState | undefined = undefined;
    private _onCollect = jest.fn();
    private _rerenderWithRound: ((round: RoundState | undefined) => void) | undefined;
    private _result: { current: { onAllCardsVisible: () => void } } | undefined;

    given = {
        round: (round: RoundState | undefined): void => {
            this._round = round;
        },
    };

    when = {
        rendered: (): void => {
            const onCollect = this._onCollect;
            const initialRound = this._round;
            const { result, rerender } = renderHook(
                ({ round }: { round: RoundState | undefined }) => useAutoCollect(round, onCollect),
                { initialProps: { round: initialRound } },
            );
            this._result = result;
            this._rerenderWithRound = (round): void => {
                rerender({ round });
            };
        },
        roundUpdated: (round: RoundState | undefined): void => {
            if (this._rerenderWithRound === undefined) throw new Error('hook not yet rendered');
            this._rerenderWithRound(round);
        },
        onAllCardsVisibleFired: (): void => {
            if (this._result === undefined) throw new Error('hook not yet rendered');
            this._result.current.onAllCardsVisible();
        },
        collectDelayElapsed: async (): Promise<void> => {
            await act(async () => {
                jest.advanceTimersByTime(AUTO_COLLECT_DELAY_MS);
            });
        },
    };

    assert = {
        onCollectCalled: (): void => {
            expect(this._onCollect).toHaveBeenCalled();
        },
        onCollectNotCalled: (): void => {
            expect(this._onCollect).not.toHaveBeenCalled();
        },
    };
}

export const makeUseAutoCollectDriver = (): UseAutoCollectDriver => new UseAutoCollectDriver();
