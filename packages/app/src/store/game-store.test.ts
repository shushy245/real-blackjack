import { GAME_CONFIG, makeGameStore } from './game-store';
import { makeLeaderboardStore } from './leaderboard-store';
import { FakeStorageAdapter } from '../testkit/fake-storage-adapter';

let gameStore: ReturnType<typeof makeGameStore>;
let leaderboardStore: ReturnType<typeof makeLeaderboardStore>;

beforeEach(() => {
    const storage = new FakeStorageAdapter();
    leaderboardStore = makeLeaderboardStore(storage);
    gameStore = makeGameStore({
        storage,
        onSessionEnd: (params) => leaderboardStore.getState().addSession(params),
    });
});

describe('initial state', () => {
    it('starts with the configured starting balance', () => {
        expect(gameStore.getState().gameState.balance).toBe(GAME_CONFIG.startingBalance);
    });

    it('starts with no active round', () => {
        expect(gameStore.getState().gameState.round).toBeUndefined();
    });

    it('restores persisted balance when initialBalance is provided', () => {
        const restoredStore = makeGameStore({
            storage: new FakeStorageAdapter(),
            initialBalance: 750,
            onSessionEnd: () => {},
        });

        expect(restoredStore.getState().gameState.balance).toBe(750);
    });
});

describe('action', () => {
    it('PlaceBet deducts the bet amount from balance', () => {
        gameStore.getState().action({ type: 'PlaceBet', amount: 50 });

        expect(gameStore.getState().gameState.balance).toBe(950);
    });

    it('PlaceBet starts a round', () => {
        gameStore.getState().action({ type: 'PlaceBet', amount: 50 });

        expect(gameStore.getState().gameState.round).toBeDefined();
    });
});

describe('newGame', () => {
    it('resets balance to the starting balance', () => {
        gameStore.getState().action({ type: 'PlaceBet', amount: 50 });
        gameStore.getState().newGame();

        expect(gameStore.getState().gameState.balance).toBe(GAME_CONFIG.startingBalance);
    });

    it('clears the active round', () => {
        gameStore.getState().action({ type: 'PlaceBet', amount: 50 });
        gameStore.getState().newGame();

        expect(gameStore.getState().gameState.round).toBeUndefined();
    });
});

describe('cashOut', () => {
    it('records the session in the leaderboard', () => {
        gameStore.getState().cashOut();

        expect(leaderboardStore.getState().sessions).toHaveLength(1);
    });

    it('records the current balance as endBalance and sessionPeak as peak', () => {
        gameStore.getState().cashOut();

        const session = leaderboardStore.getState().sessions[0];
        if (session === undefined) throw new Error('expected session at index 0');
        expect(session.endBalance).toBe(1000);
        expect(session.peak).toBe(1000);
    });

    it('resets game to the starting balance', () => {
        gameStore.getState().action({ type: 'PlaceBet', amount: 50 });
        gameStore.getState().cashOut();

        expect(gameStore.getState().gameState.balance).toBe(GAME_CONFIG.startingBalance);
    });

    it('clears the active round', () => {
        gameStore.getState().action({ type: 'PlaceBet', amount: 50 });
        gameStore.getState().cashOut();

        expect(gameStore.getState().gameState.round).toBeUndefined();
    });
});
