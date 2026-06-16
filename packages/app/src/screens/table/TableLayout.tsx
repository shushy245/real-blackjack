import type { JSX } from 'react';
import type { TextStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { Defs, Path, Pattern, Rect, Svg } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { HandResult, RoundState } from '@real-blackjack/common';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Move, calculateHand, getLegalMoves, isBlackjack, settleRound } from '@real-blackjack/common';

import { FullColumn } from '~/components/ui';
import { ActionBar } from '~/components/action-bar';
import { BetControls } from '~/components/bet-controls';
import { DealerHand, PlayerHand } from '~/components/hand';
import { GAME_CONFIG, useGameStore } from '~/store/game-store';
import { useResultFeedback } from '~/animations/useResultFeedback';

const FELT = '#0D5C2E';
const RAIL = '#2C1204';

export const TableLayout = (): JSX.Element => {
    const insets = useSafeAreaInsets();
    const gameState = useGameStore((state) => state.gameState);
    const lastBet = useGameStore((state) => state.lastBet);
    const storeAction = useGameStore((state) => state.action);
    const newGame = useGameStore((state) => state.newGame);
    const cashOut = useGameStore((state) => state.cashOut);

    const { round, balance } = gameState;

    const handlePlaceBet = (amount: number): void => storeAction({ type: 'PlaceBet', amount });
    const handleMove = (move: Move): void => storeAction({ type: move });
    const handleCollect = (): void => storeAction({ type: 'CollectResult' });

    const handleCashOut = (): void => {
        Alert.alert('Cash Out', `Cash out $${balance} and end your session?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Cash Out', style: 'destructive', onPress: cashOut },
        ]);
    };

    const legalMoves = getLegalMoves(gameState);
    const isGameOver = round === undefined && balance < GAME_CONFIG.minBet;
    const canCashOut = round === undefined && !isGameOver;

    return (
        <FullColumn style={styles.table}>
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <FeltTexture />
            </View>
            <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <BalanceBar balance={balance} canCashOut={canCashOut} onCashOut={handleCashOut} />
                <DealerZone round={round} />
                <Rail />
                <BetZonePanel
                    round={round}
                    balance={balance}
                    lastBet={lastBet}
                    isGameOver={isGameOver}
                    onPlaceBet={handlePlaceBet}
                    onCollect={handleCollect}
                    onNewGame={newGame}
                />
                <Rail />
                <PlayerZonePanel round={round} legalMoves={legalMoves} onMove={handleMove} />
            </View>
        </FullColumn>
    );
};

// ─── sub-components ────────────────────────────────────────────────────────────

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

type BalanceBarProps = { balance: number; canCashOut: boolean; onCashOut: () => void };

const BalanceBar = ({ balance, canCashOut, onCashOut }: BalanceBarProps): JSX.Element => (
    <View style={styles.balanceBar}>
        <View style={styles.balancePill}>
            <Text style={styles.balanceLabel}>{`BALANCE`}</Text>
            <Text style={styles.balanceAmount}>{`$${balance}`}</Text>
        </View>
        {canCashOut && (
            <TouchableOpacity onPress={onCashOut} style={styles.cashOutBtn} activeOpacity={0.7}>
                <Text style={styles.cashOutText}>{`CASH OUT`}</Text>
            </TouchableOpacity>
        )}
    </View>
);

type DealerZoneProps = { round: RoundState | undefined };

const DealerZone = ({ round }: DealerZoneProps): JSX.Element => {
    if (round === undefined) {
        return (
            <View style={styles.dealerZone}>
                <Text style={styles.zoneLabel}>{`DEALER`}</Text>
            </View>
        );
    }

    return (
        <View style={styles.dealerZone}>
            <DealerHand
                cards={round.dealerCards}
                hand={calculateHand(round.dealerCards)}
                isBlackjack={isBlackjack(round.dealerCards)}
                holeRevealed={round.holeCardRevealed}
            />
        </View>
    );
};

const Rail = (): JSX.Element => (
    <View style={styles.rail}>
        <View style={styles.railAccent} />
    </View>
);

type BetZonePanelProps = {
    round: RoundState | undefined;
    balance: number;
    lastBet: number;
    isGameOver: boolean;
    onPlaceBet: (amount: number) => void;
    onCollect: () => void;
    onNewGame: () => void;
};

const BetZonePanel = ({
    round,
    balance,
    lastBet,
    isGameOver,
    onPlaceBet,
    onCollect,
    onNewGame,
}: BetZonePanelProps): JSX.Element => {
    if (round === undefined) {
        if (isGameOver) return <GameOverPanel onNewGame={onNewGame} />;

        return (
            <View style={styles.betZone}>
                <BetControls
                    balance={balance}
                    minBet={GAME_CONFIG.minBet}
                    maxBet={GAME_CONFIG.maxBet}
                    lastBet={lastBet}
                    onPlaceBet={onPlaceBet}
                />
            </View>
        );
    }

    if (round.phase === 'settling') {
        return <SettleDisplay round={round} onCollect={onCollect} />;
    }

    return (
        <View style={styles.betZone}>
            <BetDisplay amount={round.activeBet} />
        </View>
    );
};

type BetDisplayProps = { amount: number };

const BetDisplay = ({ amount }: BetDisplayProps): JSX.Element => (
    <View style={styles.betDisplay}>
        <Text style={styles.betDisplayLabel}>{`BET`}</Text>
        <Text style={styles.betDisplayAmount}>{`$${amount}`}</Text>
    </View>
);

type SettleDisplayProps = { round: RoundState; onCollect: () => void };

const SettleDisplay = ({ round, onCollect }: SettleDisplayProps): JSX.Element => {
    const { netDelta, handResults } = settleRound(round);
    const variant = buildResultVariant(handResults, netDelta);
    const label = resultLabelMap[variant];
    const amountText = buildAmountText(netDelta);

    return (
        <View style={styles.betZone}>
            <View style={styles.settleResult}>
                <Text style={[styles.settleLabel, resultTextStyleMap[variant]]}>{label}</Text>
                {amountText !== '' && (
                    <Text style={[styles.settleAmount, resultTextStyleMap[variant]]}>{amountText}</Text>
                )}
            </View>
            <TouchableOpacity onPress={onCollect} style={styles.collectBtn} activeOpacity={0.8}>
                <Text style={styles.collectBtnText}>{`COLLECT`}</Text>
            </TouchableOpacity>
        </View>
    );
};

type GameOverPanelProps = { onNewGame: () => void };

const GameOverPanel = ({ onNewGame }: GameOverPanelProps): JSX.Element => (
    <View style={styles.betZone}>
        <Text style={styles.gameOverTitle}>{`OUT OF CHIPS`}</Text>
        <TouchableOpacity onPress={onNewGame} style={styles.newGameBtn} activeOpacity={0.8}>
            <Text style={styles.newGameBtnText}>{`NEW GAME`}</Text>
        </TouchableOpacity>
    </View>
);

type PlayerZonePanelProps = {
    round: RoundState | undefined;
    legalMoves: Move[];
    onMove: (move: Move) => void;
};

const PlayerZonePanel = ({ round, legalMoves, onMove }: PlayerZonePanelProps): JSX.Element => {
    const { winFlashStyle, bustFlashStyle } = useResultFeedback(round);

    if (round === undefined) {
        return (
            <View style={styles.playerZone}>
                <Text style={styles.zoneLabel}>{`PLAYER`}</Text>
            </View>
        );
    }

    const showActions = round.phase === 'player-action' || round.phase === 'insurance-pending';

    return (
        <View style={styles.playerZone}>
            <Animated.View style={[styles.flashOverlay, styles.flashGreen, winFlashStyle]} pointerEvents="none" />
            <Animated.View style={[styles.flashOverlay, styles.flashRed, bustFlashStyle]} pointerEvents="none" />
            <View style={styles.handsRow}>
                {round.playerHands.map((hand, i) => (
                    <View key={i} style={i === round.activeHandIndex ? undefined : styles.handInactive}>
                        <PlayerHand cards={hand} hand={calculateHand(hand)} isBlackjack={isBlackjack(hand)} />
                    </View>
                ))}
            </View>
            {showActions && <ActionBar moves={legalMoves} phase={round.phase} onMove={onMove} />}
        </View>
    );
};

// ─── settle helpers ────────────────────────────────────────────────────────────

type ResultVariant = 'blackjack' | 'win' | 'lost' | 'push';

const buildResultVariant = (handResults: HandResult[], netDelta: number): ResultVariant => {
    if (handResults.some((r) => r.outcome === 'blackjack')) return 'blackjack';
    if (netDelta > 0) return 'win';
    if (netDelta < 0) return 'lost';

    return 'push';
};

const buildAmountText = (netDelta: number): string => {
    if (netDelta > 0) return `+$${netDelta}`;
    if (netDelta < 0) return `-$${Math.abs(netDelta)}`;

    return '';
};

const resultLabelMap: Record<ResultVariant, string> = {
    blackjack: 'BLACKJACK',
    win: 'WIN',
    lost: 'LOST',
    push: 'PUSH',
};

// ─── styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    table: { backgroundColor: FELT },
    content: { flex: 1 },

    balanceBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    balancePill: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
    balanceLabel: { color: 'rgba(196,164,74,0.5)', fontSize: 9, letterSpacing: 3 },
    balanceAmount: { color: '#C4A44A', fontSize: 18, fontWeight: 'bold' },
    cashOutBtn: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'rgba(196,164,74,0.4)',
    },
    cashOutText: { color: 'rgba(196,164,74,0.7)', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },

    dealerZone: { flex: 3, alignItems: 'center', justifyContent: 'center' },

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
    railAccent: { height: 1, backgroundColor: 'rgba(196,164,74,0.2)' },

    betZone: { flex: 2, alignItems: 'center', justifyContent: 'center' },

    betDisplay: { alignItems: 'center', gap: 2 },
    betDisplayLabel: { color: 'rgba(196,164,74,0.5)', fontSize: 9, letterSpacing: 3 },
    betDisplayAmount: { color: '#C4A44A', fontSize: 20, fontWeight: 'bold' },

    settleResult: { alignItems: 'center', marginBottom: 8 },
    settleLabel: { fontSize: 18, fontWeight: 'bold', letterSpacing: 3 },
    settleAmount: { fontSize: 14, fontWeight: 'bold', letterSpacing: 1, marginTop: 2 },
    collectBtn: {
        paddingHorizontal: 32,
        paddingVertical: 10,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: '#C4A44A',
        backgroundColor: 'rgba(196,164,74,0.12)',
    },
    collectBtnText: { color: '#C4A44A', fontSize: 13, fontWeight: 'bold', letterSpacing: 3 },

    gameOverTitle: {
        color: '#C01120',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 3,
        marginBottom: 12,
    },
    newGameBtn: {
        paddingHorizontal: 28,
        paddingVertical: 10,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: '#C4A44A',
        backgroundColor: 'rgba(196,164,74,0.12)',
    },
    newGameBtnText: { color: '#C4A44A', fontSize: 13, fontWeight: 'bold', letterSpacing: 3 },

    playerZone: { flex: 4, alignItems: 'center', justifyContent: 'center', gap: 10, overflow: 'hidden' },
    flashOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    flashGreen: { backgroundColor: '#2ECC71' },
    flashRed: { backgroundColor: '#C01120' },
    handsRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', alignItems: 'flex-end' },
    handInactive: { opacity: 0.45, transform: [{ scale: 0.88 }] },

    zoneLabel: { color: 'rgba(196,164,74,0.2)', fontSize: 10, letterSpacing: 5 },

    resultColorBlackjack: { color: '#C4A44A' },
    resultColorWin: { color: '#2ECC71' },
    resultColorLost: { color: '#C01120' },
    resultColorPush: { color: '#FDFCF7' },
});

const resultTextStyleMap: Record<ResultVariant, TextStyle> = {
    blackjack: styles.resultColorBlackjack,
    win: styles.resultColorWin,
    lost: styles.resultColorLost,
    push: styles.resultColorPush,
};
