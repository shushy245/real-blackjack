import { GAME_CONFIG, makeGameStore } from './game-store';
import { makeGameStoreDriver } from './game-store.driver';
import { makeLeaderboardStore } from './leaderboard-store';
import { FakeStorageAdapter } from '../testkit/fake-storage-adapter';
import { makeLeaderboardStoreDriver } from './leaderboard-store.driver';

let gameStore: ReturnType<typeof makeGameStore>;
let leaderboardStore: ReturnType<typeof makeLeaderboardStore>;
let driver: ReturnType<typeof makeGameStoreDriver>;
let lbDriver: ReturnType<typeof makeLeaderboardStoreDriver>;

beforeEach(() => {
    const storage = new FakeStorageAdapter();
    leaderboardStore = makeLeaderboardStore(storage);
    gameStore = makeGameStore({
        storage,
        onSessionEnd: (params) => leaderboardStore.getState().addSession(params),
    });
    driver = makeGameStoreDriver();
    lbDriver = makeLeaderboardStoreDriver();
});

describe('initial state', () => {
    it('starts with the configured starting balance', () => {
        driver.assert.balance(gameStore, GAME_CONFIG.startingBalance);
    });

    it('starts with no active round', () => {
        driver.assert.roundUndefined(gameStore);
    });

    it('restores persisted balance when initialBalance is provided', () => {
        const restoredStore = makeGameStore({
            storage: new FakeStorageAdapter(),
            initialBalance: 750,
            onSessionEnd: () => {},
        });
        driver.assert.balance(restoredStore, 750);
    });
});

describe('action', () => {
    it('PlaceBet deducts the bet amount from balance', () => {
        gameStore.getState().action({ type: 'PlaceBet', amount: 50 });
        driver.assert.balance(gameStore, 950);
    });

    it('PlaceBet starts a round', () => {
        gameStore.getState().action({ type: 'PlaceBet', amount: 50 });
        driver.assert.roundDefined(gameStore);
    });
});

describe('newGame', () => {
    it('resets balance to the starting balance', () => {
        gameStore.getState().action({ type: 'PlaceBet', amount: 50 });
        gameStore.getState().newGame();
        driver.assert.balance(gameStore, GAME_CONFIG.startingBalance);
    });

    it('clears the active round', () => {
        gameStore.getState().action({ type: 'PlaceBet', amount: 50 });
        gameStore.getState().newGame();
        driver.assert.roundUndefined(gameStore);
    });
});

describe('cashOut', () => {
    it('records the session in the leaderboard', () => {
        gameStore.getState().cashOut();
        lbDriver.assert.sessionCount(leaderboardStore, 1);
    });

    it('records the current balance as endBalance and sessionPeak as peak', () => {
        gameStore.getState().cashOut();
        const session = leaderboardStore.getState().sessions[0];
        if (session === undefined) throw new Error('expected session at index 0');
        lbDriver.assert.sessionEndBalance(session, 1000);
        lbDriver.assert.sessionPeak(session, 1000);
    });

    it('resets game to the starting balance', () => {
        gameStore.getState().action({ type: 'PlaceBet', amount: 50 });
        gameStore.getState().cashOut();
        driver.assert.balance(gameStore, GAME_CONFIG.startingBalance);
    });

    it('clears the active round', () => {
        gameStore.getState().action({ type: 'PlaceBet', amount: 50 });
        gameStore.getState().cashOut();
        driver.assert.roundUndefined(gameStore);
    });
});
