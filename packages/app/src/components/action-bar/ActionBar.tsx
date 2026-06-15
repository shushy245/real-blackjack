import type { JSX } from 'react';
import { Move } from '@real-blackjack/common';
import type { RoundPhase } from '@real-blackjack/common';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { type MoveVariant, buildMoveConfig } from './ActionBar.utils';

type ActionBarProps = {
    moves: Move[];
    phase: RoundPhase;
    onMove: (move: Move) => void;
};

export const ActionBar = ({ moves, phase, onMove }: ActionBarProps): JSX.Element => (
    <View style={styles.container}>
        {moves.map((move) => {
            const { label, variant } = buildMoveConfig(move, phase);

            return <MoveButton key={move} label={label} variant={variant} onPress={() => onMove(move)} />;
        })}
    </View>
);

type MoveButtonProps = { label: string; variant: MoveVariant; onPress: () => void };

const MoveButton = ({ label, variant, onPress }: MoveButtonProps): JSX.Element => (
    <TouchableOpacity onPress={onPress} style={[styles.btn, btnStyleMap[variant]]} activeOpacity={0.7}>
        <Text style={[styles.btnText, btnTextStyleMap[variant]]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    btn: {
        flex: 1,
        paddingVertical: 11,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnPrimary: {
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderWidth: 1.5,
        borderColor: 'rgba(253,252,247,0.65)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 3,
    },
    btnSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(196,164,74,0.5)',
    },
    btnText: {
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    btnTextPrimary: {
        color: '#FDFCF7',
        fontSize: 13,
    },
    btnTextSecondary: {
        color: '#C4A44A',
        fontSize: 11,
    },
});

const btnStyleMap: Record<MoveVariant, ViewStyle> = {
    primary: styles.btnPrimary,
    secondary: styles.btnSecondary,
};

const btnTextStyleMap: Record<MoveVariant, TextStyle> = {
    primary: styles.btnTextPrimary,
    secondary: styles.btnTextSecondary,
};
