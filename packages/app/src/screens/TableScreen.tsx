import type { JSX } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { FullColumn } from '~/components/ui';

const handleLeaderboard = (): void => {
    router.push('/leaderboard');
};

export const TableScreen = (): JSX.Element => (
    <FullColumn style={styles.felt}>
        <Text style={styles.title}>{`Real Blackjack`}</Text>
        <TouchableOpacity onPress={handleLeaderboard} style={styles.button}>
            <Text style={styles.buttonText}>{`Leaderboard`}</Text>
        </TouchableOpacity>
    </FullColumn>
);

const styles = StyleSheet.create({
    felt: { alignItems: 'center', backgroundColor: '#1a5c2e', justifyContent: 'center' },
    title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
    button: { borderColor: '#fff', borderRadius: 8, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 10 },
    buttonText: { color: '#fff', fontSize: 16 },
});
