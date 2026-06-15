import type { HandValue } from '@real-blackjack/common';

export const CARD_WIDTH = 70;
export const CARD_HEIGHT = 98;
export const OVERLAP = 22;

export type ScoreBadgeVariant = 'normal' | 'blackjack' | 'bust';

export const buildScoreLabel = (hand: HandValue, isBlackjackResult: boolean): string => {
    if (isBlackjackResult) return 'BJ';
    if (hand.value > 21) return 'BUST';
    if (hand.isSoft) return `S${hand.value}`;

    return `${hand.value}`;
};

export const buildBadgeVariant = (hand: HandValue, isBlackjackResult: boolean): ScoreBadgeVariant => {
    if (isBlackjackResult) return 'blackjack';
    if (hand.value > 21) return 'bust';

    return 'normal';
};
