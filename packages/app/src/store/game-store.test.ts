import { createGame } from '@real-blackjack/common';

import { GAME_CONFIG, useGameStore } from './game-store';
import { useLeaderboardStore } from './leaderboard-store';

beforeEach(() => {
    useGameStore.setState({ gameState: createGame(GAME_CONFIG) });
    useLeaderboardStore.setState({ sessions: [] });
});

describe('initial state', () => {
    it('starts with the configured starting balance', () => {
        expect(useGameStore.getState().gameState.balance).toBe(GAME_CONFIG.startingBalance);
    });

    it('starts with no active round', () => {
        expect(useGameStore.getState().gameState.round).toBeUndefined();
    });
});

describe('action', () => {
    it('PlaceBet deducts the bet amount from balance', () => {
        useGameStore.getState().action({ type: 'PlaceBet', amount: 50 });

        expect(useGameStore.getState().gameState.balance).toBe(950);
    });

    it('PlaceBet starts a round', () => {
        useGameStore.getState().action({ type: 'PlaceBet', amount: 50 });

        expect(useGameStore.getState().gameState.round).toBeDefined();
    });
});

describe('newGame', () => {
    it('resets balance to the starting balance', () => {
        useGameStore.getState().action({ type: 'PlaceBet', amount: 50 });
        useGameStore.getState().newGame();

        expect(useGameStore.getState().gameState.balance).toBe(GAME_CONFIG.startingBalance);
    });

    it('clears the active round', () => {
        useGameStore.getState().action({ type: 'PlaceBet', amount: 50 });
        useGameStore.getState().newGame();

        expect(useGameStore.getState().gameState.round).toBeUndefined();
    });
});

describe('cashOut', () => {
    it('records the session in the leaderboard', () => {
        useGameStore.getState().cashOut();

        expect(useLeaderboardStore.getState().sessions).toHaveLength(1);
    });

    it('records the current balance as endBalance and sessionPeak as peak', () => {
        useGameStore.getState().cashOut();

        const session = useLeaderboardStore.getState().sessions[0];
        expect(session?.endBalance).toBe(1000);
        expect(session?.peak).toBe(1000);
    });

    it('resets game to the starting balance', () => {
        useGameStore.getState().action({ type: 'PlaceBet', amount: 50 });
        useGameStore.getState().cashOut();

        expect(useGameStore.getState().gameState.balance).toBe(GAME_CONFIG.startingBalance);
    });

    it('clears the active round', () => {
        useGameStore.getState().action({ type: 'PlaceBet', amount: 50 });
        useGameStore.getState().cashOut();

        expect(useGameStore.getState().gameState.round).toBeUndefined();
    });
});
