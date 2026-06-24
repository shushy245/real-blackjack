import type { JSX } from 'react';
import type { TextStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import type { Card, Hand } from '@real-blackjack/common';

import { CardView, DealingCard } from '~/components/card';

import {
    CARD_HEIGHT,
    CARD_WIDTH,
    OVERLAP,
    type ScoreBadgeVariant,
    buildBadgeVariant,
    buildScoreLabel,
} from './Hand.utils';

type PlayerHandProps = { hand: Hand };

export const PlayerHand = ({ hand }: PlayerHandProps): JSX.Element => {
    const variant = buildBadgeVariant(hand);
    const label = buildScoreLabel(hand);

    return (
        <View style={styles.container}>
            <CardFan cards={hand.cards} />
            <ScoreBadge label={label} variant={variant} />
        </View>
    );
};

type CardFanProps = { cards: readonly Card[] };

const CardFan = ({ cards }: CardFanProps): JSX.Element => (
    <View style={styles.fan}>
        {cards.map((card, i) => (
            <View key={i} style={i === 0 ? undefined : styles.cardOverlap}>
                <DealingCard>
                    <CardView card={card} face="up" width={CARD_WIDTH} />
                </DealingCard>
            </View>
        ))}
    </View>
);

type ScoreBadgeProps = { label: string; variant: ScoreBadgeVariant };

const ScoreBadge = ({ label, variant }: ScoreBadgeProps): JSX.Element => (
    <View style={styles.badge}>
        <Text style={badgeTextStyleMap[variant]}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: 8,
    },
    fan: {
        flexDirection: 'row',
        alignItems: 'center',
        height: CARD_HEIGHT,
    },
    cardOverlap: {
        marginLeft: -OVERLAP,
    },
    badge: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderColor: 'rgba(196,164,74,0.55)',
        borderRadius: 10,
        borderWidth: 1,
        minWidth: 52,
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
    },
    badgeTextNormal: {
        color: '#FDFCF7',
        fontSize: 15,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    badgeTextBlackjack: {
        color: '#C4A44A',
        fontSize: 15,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    badgeTextBust: {
        color: '#C01120',
        fontSize: 15,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});

const badgeTextStyleMap: Record<ScoreBadgeVariant, TextStyle> = {
    normal: styles.badgeTextNormal,
    blackjack: styles.badgeTextBlackjack,
    bust: styles.badgeTextBust,
};
