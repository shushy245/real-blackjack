import type { JSX } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text } from 'react-native';
import { createGame } from '@real-blackjack/common';

import { FullColumn } from './src/components/ui';

const game = createGame({ startingBalance: 1000, minBet: 10, maxBet: 1000 });

// eslint-disable-next-line import/no-default-export
export default function App(): JSX.Element {
    return (
        <FullColumn style={styles.felt}>
            <Text>{`Balance: $${game.balance}`}</Text>
            <StatusBar style="auto" />
        </FullColumn>
    );
}

const styles = StyleSheet.create({
    felt: { alignItems: 'center', backgroundColor: '#1a5c2e', justifyContent: 'center' },
});
