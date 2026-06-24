export type ChipDenomination = 10 | 25 | 50 | 100 | 500;

export type ChipConfig = {
    readonly color: string;
    readonly edgeColor: string;
    readonly label: string;
};

export const CHIP_DENOMINATIONS: readonly ChipDenomination[] = [10, 25, 50, 100, 500];

export const chipConfigMap: Record<ChipDenomination, ChipConfig> = {
    10: { color: '#1E3F9E', edgeColor: '#5577DD', label: '$10' },
    25: { color: '#1D6035', edgeColor: '#3DA060', label: '$25' },
    50: { color: '#B04E18', edgeColor: '#D87840', label: '$50' },
    100: { color: '#1A1A2E', edgeColor: '#6060A0', label: '$100' },
    500: { color: '#3D1570', edgeColor: '#8040C0', label: '$500' },
};

export const BetControlsTestIds = {
    BetCounter: 'BetControlsTestIds.BetCounter',
    ChipButton: (denom: ChipDenomination): string => `BetControlsTestIds.ChipButton.${denom}`,
    ClearButton: 'BetControlsTestIds.ClearButton',
    DealButton: 'BetControlsTestIds.DealButton',
};

export const clampBet = (current: number, added: number, balance: number): number => Math.min(current + added, balance);

export const formatAmount = (amount: number): string => `$${amount}`;

export const defaultPendingBet = ({ lastBet, balance }: { lastBet: number; balance: number }): number =>
    lastBet > 0 ? Math.min(lastBet, balance) : 0;

export const canDeal = ({ pendingBet, minBet }: { pendingBet: number; minBet: number }): boolean =>
    pendingBet >= minBet;

export const isChipDisabled = ({
    denom,
    pendingBet,
    balance,
}: {
    denom: number;
    pendingBet: number;
    balance: number;
}): boolean => pendingBet + denom > balance;
