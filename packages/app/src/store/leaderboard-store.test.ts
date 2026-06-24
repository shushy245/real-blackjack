import { makeLeaderboardStore } from './leaderboard-store';
import { FakeStorageAdapter } from '../testkit/fake-storage-adapter';
import { makeLeaderboardStoreDriver } from './leaderboard-store.driver';

let leaderboardStore: ReturnType<typeof makeLeaderboardStore>;
let driver: ReturnType<typeof makeLeaderboardStoreDriver>;

beforeEach(() => {
    leaderboardStore = makeLeaderboardStore(new FakeStorageAdapter());
    driver = makeLeaderboardStoreDriver();
});

describe('addSession', () => {
    it('adds a session with a prefixed id and ISO date', () => {
        leaderboardStore.getState().addSession({ peak: 1500, endBalance: 1200 });
        driver.assert.sessionCount(leaderboardStore, 1);
        const first = leaderboardStore.getState().sessions[0];
        if (first === undefined) throw new Error('expected session at index 0');
        driver.assert.sessionIdPrefixed(first);
        driver.assert.sessionDateIsIso(first);
        driver.assert.sessionPeak(first, 1500);
        driver.assert.sessionEndBalance(first, 1200);
    });

    it('sorts sessions by peak balance descending', () => {
        leaderboardStore.getState().addSession({ peak: 1000, endBalance: 800 });
        leaderboardStore.getState().addSession({ peak: 2000, endBalance: 1500 });
        leaderboardStore.getState().addSession({ peak: 1500, endBalance: 1200 });
        const [first, second, third] = leaderboardStore.getState().sessions;
        if (first === undefined || second === undefined || third === undefined)
            throw new Error('expected at least 3 sessions');
        driver.assert.sessionPeak(first, 2000);
        driver.assert.sessionPeak(second, 1500);
        driver.assert.sessionPeak(third, 1000);
    });

    it('retains at most 20 sessions', () => {
        for (let i = 0; i < 25; i++) {
            leaderboardStore.getState().addSession({ peak: 1000 + i, endBalance: 900 });
        }
        driver.assert.sessionCount(leaderboardStore, 20);
    });

    it('keeps the 20 highest-peak sessions when trimming', () => {
        for (let i = 0; i < 25; i++) {
            leaderboardStore.getState().addSession({ peak: 1000 + i, endBalance: 900 });
        }
        const last = leaderboardStore.getState().sessions.at(-1);
        if (last === undefined) throw new Error('expected at least one session');
        driver.assert.sessionPeak(last, 1005);
    });
});
