import type { HandResult } from '@real-blackjack/common';

import { GAME_CONFIG } from '~/store';

export type ResultVariant = 'blackjack' | 'win' | 'lost' | 'push';

export const buildResultVariant = (handResults: HandResult[], netDelta: number): ResultVariant => {
    if (handResults.some((r) => r.outcome === 'blackjack')) return 'blackjack';
    if (netDelta > 0) return 'win';
    if (netDelta < 0) return 'lost';

    return 'push';
};

export const buildAmountText = (netDelta: number): string => {
    if (netDelta > 0) return `+$${netDelta}`;
    if (netDelta < 0) return `-$${Math.abs(netDelta)}`;

    return '';
};

export const isGameOver = (balance: number): boolean => balance < GAME_CONFIG.minBet;
