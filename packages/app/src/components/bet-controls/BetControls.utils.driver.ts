import { clampBet, defaultPendingBet, formatAmount } from './BetControls.utils';

type BetControlsUtilsDriver = {
    assert: {
        clampBet: (current: number, added: number, balance: number, expected: number) => void;
        defaultPendingBet: (lastBet: number, balance: number, expected: number) => void;
        formatAmount: (value: number, expected: string) => void;
    };
};

export const makeBetControlsUtilsDriver = (): BetControlsUtilsDriver => ({
    assert: {
        clampBet: (current, added, balance, expected): void => {
            expect(clampBet(current, added, balance)).toBe(expected);
        },
        defaultPendingBet: (lastBet, balance, expected): void => {
            expect(defaultPendingBet({ lastBet, balance })).toBe(expected);
        },
        formatAmount: (value, expected): void => {
            expect(formatAmount(value)).toBe(expected);
        },
    },
});
