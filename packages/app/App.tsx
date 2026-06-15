import type { JSX } from 'react';
import { StatusBar } from 'expo-status-bar';
import { createGame } from '@real-blackjack/common';
import { StyleSheet, Text, View } from 'react-native';

const game = createGame({ startingBalance: 1000, minBet: 10, maxBet: 1000 });

// eslint-disable-next-line import/no-default-export
export default function App(): JSX.Element {
    return (
        <View style={styles.container}>
            <Text>{`Balance: $${game.balance}`}</Text>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a5c2e',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
