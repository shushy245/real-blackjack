import { Move } from '@real-blackjack/common';
import type { RoundPhase } from '@real-blackjack/common';

export type MoveVariant = 'primary' | 'secondary';

export type MoveButtonConfig = {
    readonly label: string;
    readonly variant: MoveVariant;
};

const defaultLabelMap: Record<Move, string> = {
    [Move.Hit]: 'HIT',
    [Move.Stand]: 'STAND',
    [Move.Double]: 'DOUBLE',
    [Move.Split]: 'SPLIT',
    [Move.Insurance]: 'INSURANCE',
};

const insuranceLabelMap: Partial<Record<Move, string>> = {
    [Move.Insurance]: 'INSURE',
    [Move.Stand]: 'DECLINE',
};

const primaryMovesDefault = new Set<Move>([Move.Hit, Move.Stand]);

export const buildMoveConfig = (move: Move, phase: RoundPhase): MoveButtonConfig => {
    const isInsurance = phase === 'insurance-pending';
    const label = (isInsurance ? insuranceLabelMap[move] : undefined) ?? defaultLabelMap[move];
    const variant: MoveVariant = isInsurance
        ? move === Move.Insurance
            ? 'primary'
            : 'secondary'
        : primaryMovesDefault.has(move)
          ? 'primary'
          : 'secondary';

    return { label, variant };
};
