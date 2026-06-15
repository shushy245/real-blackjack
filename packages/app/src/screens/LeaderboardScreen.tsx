import type { JSX } from 'react';
import { StyleSheet, Text } from 'react-native';

import { FullColumn } from '~/components/ui';

export const LeaderboardScreen = (): JSX.Element => (
    <FullColumn style={styles.container}>
        <Text style={styles.title}>{`Leaderboard`}</Text>
        <Text style={styles.subtitle}>{`Coming soon`}</Text>
    </FullColumn>
);

const styles = StyleSheet.create({
    container: { alignItems: 'center', backgroundColor: '#0a0a0a', justifyContent: 'center' },
    title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
    subtitle: { color: '#888', fontSize: 16 },
});
