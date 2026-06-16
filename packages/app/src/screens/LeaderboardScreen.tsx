import type { JSX } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Session } from '~/store';
import { FullColumn } from '~/components/ui';
import { useLeaderboardStore } from '~/store';

export const LeaderboardScreen = (): JSX.Element => {
    const sessions = useLeaderboardStore((state) => state.sessions);
    const insets = useSafeAreaInsets();

    return (
        <FullColumn style={styles.screen}>
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <Text style={styles.headerEyebrow}>{`REAL BLACKJACK`}</Text>
                <Text style={styles.headerTitle}>{`HIGH SCORES`}</Text>
                <View style={styles.headerRule} />
            </View>
            {sessions.length === 0 ? (
                <EmptyState />
            ) : (
                <FlatList
                    data={sessions}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => <SessionRow session={item} rank={index + 1} />}
                    ItemSeparatorComponent={Divider}
                    contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </FullColumn>
    );
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatDate = (iso: string): string => {
    const d = new Date(iso);
    const month = MONTH_LABELS[d.getMonth()] ?? '';

    return `${month} ${d.getDate()}, ${d.getFullYear()}`;
};

const rankLabel = (rank: number): string => (rank <= 9 ? `0${rank}` : `${rank}`);

type SessionRowProps = { session: Session; rank: number };

const SessionRow = ({ session, rank }: SessionRowProps): JSX.Element => (
    <View style={styles.row}>
        <Text style={styles.rowRank}>{rankLabel(rank)}</Text>
        <View style={styles.rowBody}>
            <View style={styles.rowTop}>
                <Text style={styles.rowPeakLabel}>{`PEAK`}</Text>
                <Text style={styles.rowPeak}>{`$${session.peak}`}</Text>
            </View>
            <View style={styles.rowBottom}>
                <Text style={styles.rowEndLabel}>{`ENDED`}</Text>
                <Text style={styles.rowEnd}>{`$${session.endBalance}`}</Text>
                <Text style={styles.rowDate}>{formatDate(session.date)}</Text>
            </View>
        </View>
    </View>
);

const Divider = (): JSX.Element => <View style={styles.divider} />;

const EmptyState = (): JSX.Element => (
    <View style={styles.empty}>
        <Text style={styles.emptyIcon}>{`♠`}</Text>
        <Text style={styles.emptyTitle}>{`NO SESSIONS YET`}</Text>
        <Text style={styles.emptySubtitle}>{`Cash out a session to see it here`}</Text>
    </View>
);

const styles = StyleSheet.create({
    screen: {
        backgroundColor: '#080D1A',
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    headerEyebrow: {
        color: 'rgba(196,164,74,0.45)',
        fontSize: 9,
        letterSpacing: 5,
        marginBottom: 6,
    },
    headerTitle: {
        color: '#C4A44A',
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: 6,
        marginBottom: 16,
    },
    headerRule: {
        height: 1,
        backgroundColor: 'rgba(196,164,74,0.25)',
    },
    list: {
        paddingTop: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        gap: 16,
    },
    rowRank: {
        color: 'rgba(196,164,74,0.25)',
        fontSize: 28,
        fontWeight: 'bold',
        width: 40,
        textAlign: 'right',
    },
    rowBody: {
        flex: 1,
        gap: 4,
    },
    rowTop: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    rowPeakLabel: {
        color: 'rgba(196,164,74,0.5)',
        fontSize: 9,
        letterSpacing: 2,
    },
    rowPeak: {
        color: '#C4A44A',
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    rowBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rowEndLabel: {
        color: 'rgba(253,252,247,0.3)',
        fontSize: 9,
        letterSpacing: 2,
    },
    rowEnd: {
        color: 'rgba(253,252,247,0.6)',
        fontSize: 13,
        fontWeight: 'bold',
    },
    rowDate: {
        color: 'rgba(253,252,247,0.25)',
        fontSize: 11,
        marginLeft: 4,
    },
    divider: {
        height: 1,
        marginHorizontal: 24,
        backgroundColor: 'rgba(196,164,74,0.1)',
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    emptyIcon: {
        color: 'rgba(196,164,74,0.2)',
        fontSize: 48,
        marginBottom: 8,
    },
    emptyTitle: {
        color: 'rgba(196,164,74,0.5)',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 4,
    },
    emptySubtitle: {
        color: 'rgba(253,252,247,0.25)',
        fontSize: 12,
        letterSpacing: 1,
    },
});
