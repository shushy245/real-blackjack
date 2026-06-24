import type { JSX } from 'react';
import type { TextStyle } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Card, Hand } from '@real-blackjack/common';

import { DEALER_CARD_DELAY_MS } from '~/animations/constants';
import { CardView, DealingCard, FlippableCard } from '~/components/card';

import {
    CARD_HEIGHT,
    CARD_WIDTH,
    OVERLAP,
    type ScoreBadgeVariant,
    buildBadgeVariant,
    buildScoreLabel,
    hasMoreCardsToShow,
} from './Hand.utils';

type DealerHandProps = {
    hand: Hand;
    holeRevealed: boolean;
    onAllCardsVisible: () => void;
};

export const DealerHand = ({ hand, holeRevealed, onAllCardsVisible }: DealerHandProps): JSX.Element => {
    const variant = buildBadgeVariant(hand);
    const label = buildScoreLabel(hand);

    return (
        <View style={styles.container}>
            <DealerCardFan cards={hand.cards} holeRevealed={holeRevealed} onAllCardsVisible={onAllCardsVisible} />
            {holeRevealed && <ScoreBadge label={label} variant={variant} />}
        </View>
    );
};

type DealerCardFanProps = {
    cards: readonly Card[];
    holeRevealed: boolean;
    onAllCardsVisible: () => void;
};

const DealerCardFan = ({ cards, holeRevealed, onAllCardsVisible }: DealerCardFanProps): JSX.Element => {
    const [visibleCount, setVisibleCount] = useState(0);
    const onAllCardsVisibleRef = useRef(onAllCardsVisible);
    onAllCardsVisibleRef.current = onAllCardsVisible;

    useEffect(() => {
        if (cards.length === 0) {
            setVisibleCount(0);

            return;
        }
        if (hasMoreCardsToShow(visibleCount, cards.length)) {
            const delay = visibleCount === 0 ? 0 : DEALER_CARD_DELAY_MS;
            const timer = setTimeout(() => {
                setVisibleCount((prev) => prev + 1);
            }, delay);

            return () => {
                clearTimeout(timer);
            };
        }
        onAllCardsVisibleRef.current();

        return undefined;
    }, [cards.length, visibleCount]);

    return (
        <View style={styles.fan}>
            {cards.slice(0, visibleCount).map((card, i) => (
                <View key={i} style={i === 0 ? undefined : styles.cardOverlap}>
                    <DealingCard>
                        {i === 1 ? (
                            <FlippableCard
                                front={<CardView card={card} face="up" width={CARD_WIDTH} />}
                                back={<CardView card={card} face="down" width={CARD_WIDTH} />}
                                flipped={holeRevealed}
                            />
                        ) : (
                            <CardView card={card} face="up" width={CARD_WIDTH} />
                        )}
                    </DealingCard>
                </View>
            ))}
        </View>
    );
};

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
