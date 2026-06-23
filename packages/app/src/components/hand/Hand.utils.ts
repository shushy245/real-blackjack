import type { Hand } from '@real-blackjack/common';

export const CARD_WIDTH = 70;
export const CARD_HEIGHT = 98;
export const OVERLAP = 22;

export type ScoreBadgeVariant = 'normal' | 'blackjack' | 'bust';

export const buildScoreLabel = (hand: Hand): string => {
    if (hand.isBlackjack()) return 'BJ';
    if (hand.isBust()) return 'BUST';
    const { value, isSoft } = hand.value();
    if (isSoft) return `S${value}`;

    return `${value}`;
};

export const buildBadgeVariant = (hand: Hand): ScoreBadgeVariant => {
    if (hand.isBlackjack()) return 'blackjack';
    if (hand.isBust()) return 'bust';

    return 'normal';
};
