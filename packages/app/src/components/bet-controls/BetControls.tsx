import type { JSX } from 'react';
import { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import { useSoundEffects } from '~/sounds';

import {
    BetControlsTestIds,
    CHIP_DENOMINATIONS,
    type ChipDenomination,
    canDeal,
    canRepeatBet,
    chipConfigMap,
    clampBet,
    formatAmount,
    isChipDisabled,
} from './BetControls.utils';

type BetControlsProps = {
    balance: number;
    minBet: number;
    lastBet: number;
    onPlaceBet: (amount: number) => void;
};

export const BetControls = ({ balance, minBet, lastBet, onPlaceBet }: BetControlsProps): JSX.Element => {
    const [pendingBet, setPendingBet] = useState(0);

    const handleChip = (chip: ChipDenomination): void => setPendingBet((prev) => clampBet(prev, chip, balance));

    const handleClear = (): void => setPendingBet(0);

    const handleRepeat = (): void => setPendingBet(Math.min(lastBet, balance));

    const handleDeal = (): void => {
        if (!canDeal({ pendingBet, minBet })) return;
        onPlaceBet(pendingBet);
        setPendingBet(0);
    };

    const isDealEnabled = canDeal({ pendingBet, minBet });
    const isRepeatEnabled = canRepeatBet({ lastBet, minBet, balance });

    return (
        <View style={styles.container}>
            <BetCounter amount={pendingBet} />
            <ChipTray balance={balance} pendingBet={pendingBet} onChip={handleChip} />
            <ActionRow
                canDeal={isDealEnabled}
                canRepeat={isRepeatEnabled}
                onClear={handleClear}
                onRepeat={handleRepeat}
                onDeal={handleDeal}
            />
        </View>
    );
};

type BetCounterProps = { amount: number };

const BetCounter = ({ amount }: BetCounterProps): JSX.Element => (
    <View style={styles.counter}>
        <Text style={styles.counterLabel}>{`BET`}</Text>
        <Text testID={BetControlsTestIds.BetCounter} style={styles.counterAmount}>
            {formatAmount(amount)}
        </Text>
    </View>
);

type ChipTrayProps = {
    balance: number;
    pendingBet: number;
    onChip: (chip: ChipDenomination) => void;
};

const ChipTray = ({ balance, pendingBet, onChip }: ChipTrayProps): JSX.Element => (
    <View style={styles.tray}>
        {CHIP_DENOMINATIONS.map((denom) => (
            <AnimatedChip
                key={denom}
                denom={denom}
                disabled={isChipDisabled({ denom, pendingBet, balance })}
                onChip={onChip}
            />
        ))}
    </View>
);

type ActionRowProps = {
    canDeal: boolean;
    canRepeat: boolean;
    onClear: () => void;
    onRepeat: () => void;
    onDeal: () => void;
};

const ActionRow = ({ canDeal, canRepeat, onClear, onRepeat, onDeal }: ActionRowProps): JSX.Element => (
    <View style={styles.actionRow}>
        <TouchableOpacity
            testID={BetControlsTestIds.ClearButton}
            onPress={onClear}
            style={styles.secondaryBtn}
            activeOpacity={0.7}
        >
            <Text style={styles.secondaryBtnText}>{`CLEAR`}</Text>
        </TouchableOpacity>
        <TouchableOpacity
            testID={BetControlsTestIds.RepeatButton}
            onPress={onRepeat}
            disabled={!canRepeat}
            style={[styles.secondaryBtn, !canRepeat ? styles.btnDisabled : undefined]}
            activeOpacity={0.7}
        >
            <Text style={[styles.secondaryBtnText, !canRepeat ? styles.textDisabled : undefined]}>{`REPEAT`}</Text>
        </TouchableOpacity>
        <TouchableOpacity
            testID={BetControlsTestIds.DealButton}
            onPress={onDeal}
            disabled={!canDeal}
            style={[styles.dealBtn, !canDeal ? styles.btnDisabled : undefined]}
            activeOpacity={0.8}
        >
            <Text style={[styles.dealBtnText, !canDeal ? styles.textDisabled : undefined]}>{`DEAL`}</Text>
        </TouchableOpacity>
    </View>
);

type AnimatedChipProps = {
    denom: ChipDenomination;
    disabled: boolean;
    onChip: (chip: ChipDenomination) => void;
};

const AnimatedChip = ({ denom, disabled, onChip }: AnimatedChipProps): JSX.Element => {
    const scale = useSharedValue(1);
    const animating = useRef(false);
    const cfg = chipConfigMap[denom];
    const sounds = useSoundEffects();

    const handlePress = (): void => {
        sounds.chip();
        if (!animating.current) {
            animating.current = true;
            scale.value = withSequence(
                withSpring(1.2, { damping: 8, stiffness: 300 }),
                withSpring(1, {}, () => {
                    animating.current = false;
                }),
            );
        }
        onChip(denom);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={animatedStyle}>
            <TouchableOpacity
                testID={BetControlsTestIds.ChipButton(denom)}
                onPress={handlePress}
                disabled={disabled}
                style={[
                    styles.chip,
                    disabled ? styles.chipDisabled : undefined,
                    { backgroundColor: cfg.color, borderColor: cfg.edgeColor },
                ]}
                activeOpacity={0.7}
            >
                <View style={[styles.chipInner, { borderColor: cfg.edgeColor }]}>
                    <Text style={styles.chipLabel}>{cfg.label}</Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const CHIP_SIZE = 48;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: 8,
        paddingVertical: 4,
    },
    counter: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    counterLabel: {
        color: 'rgba(196,164,74,0.6)',
        fontSize: 10,
        letterSpacing: 3,
    },
    counterAmount: {
        color: '#C4A44A',
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 1,
        minWidth: 80,
        textAlign: 'center',
    },
    tray: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    chip: {
        width: CHIP_SIZE,
        height: CHIP_SIZE,
        borderRadius: CHIP_SIZE / 2,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        elevation: 4,
    },
    chipInner: {
        width: CHIP_SIZE - 10,
        height: CHIP_SIZE - 10,
        borderRadius: (CHIP_SIZE - 10) / 2,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipLabel: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    chipDisabled: {
        opacity: 0.3,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    secondaryBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(196,164,74,0.35)',
    },
    secondaryBtnText: {
        color: 'rgba(196,164,74,0.75)',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    dealBtn: {
        paddingHorizontal: 28,
        paddingVertical: 10,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: '#C4A44A',
        backgroundColor: 'rgba(196,164,74,0.12)',
    },
    dealBtnText: {
        color: '#C4A44A',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 3,
    },
    btnDisabled: {
        opacity: 0.3,
    },
    textDisabled: {
        color: 'rgba(196,164,74,0.4)',
    },
});
