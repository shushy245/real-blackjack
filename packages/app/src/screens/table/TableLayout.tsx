import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Defs, Path, Pattern, Rect, Svg } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FullColumn } from '~/components/ui';

const FELT = '#0D5C2E';
const RAIL = '#2C1204';

export const TableLayout = (): JSX.Element => {
    const insets = useSafeAreaInsets();

    return (
        <FullColumn style={styles.table}>
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <FeltTexture />
            </View>
            <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <DealerZone />
                <Rail />
                <BetZone />
                <Rail />
                <PlayerZone />
            </View>
        </FullColumn>
    );
};

const FeltTexture = (): JSX.Element => (
    <Svg width="100%" height="100%">
        <Defs>
            <Pattern id="felt" x={0} y={0} width={6} height={6} patternUnits="userSpaceOnUse">
                <Path d="M0,6 L6,0" stroke="rgba(255,255,255,0.07)" strokeWidth={0.6} />
                <Path d="M-1,1 L1,-1" stroke="rgba(255,255,255,0.035)" strokeWidth={0.5} />
                <Path d="M5,7 L7,5" stroke="rgba(255,255,255,0.035)" strokeWidth={0.5} />
            </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#felt)`} />
    </Svg>
);

const DealerZone = (): JSX.Element => (
    <View style={styles.dealerZone}>
        <Text style={styles.zoneLabel}>{`DEALER`}</Text>
    </View>
);

const Rail = (): JSX.Element => (
    <View style={styles.rail}>
        <View style={styles.railAccent} />
    </View>
);

const BetZone = (): JSX.Element => (
    <View style={styles.betZone}>
        <View style={styles.betOval}>
            <Text style={styles.betLabel}>{`BET`}</Text>
        </View>
    </View>
);

const PlayerZone = (): JSX.Element => (
    <View style={styles.playerZone}>
        <Text style={styles.zoneLabel}>{`PLAYER`}</Text>
    </View>
);

const styles = StyleSheet.create({
    table: {
        backgroundColor: FELT,
    },
    content: {
        flex: 1,
    },
    dealerZone: {
        flex: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rail: {
        height: 14,
        backgroundColor: RAIL,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.55,
        shadowRadius: 4,
        elevation: 4,
    },
    railAccent: {
        height: 1,
        backgroundColor: `rgba(196,164,74,0.2)`,
    },
    betZone: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    betOval: {
        width: 180,
        height: 64,
        borderRadius: 1000,
        borderWidth: 1.5,
        borderColor: `rgba(196,164,74,0.5)`,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    betLabel: {
        color: `rgba(196,164,74,0.45)`,
        fontSize: 11,
        letterSpacing: 4,
    },
    playerZone: {
        flex: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    zoneLabel: {
        color: `rgba(196,164,74,0.2)`,
        fontSize: 10,
        letterSpacing: 5,
    },
});
