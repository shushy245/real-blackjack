import { makeLeaderboardStore } from './leaderboard-store';
import { FakeStorageAdapter } from '../testkit/fake-storage-adapter';

let leaderboardStore: ReturnType<typeof makeLeaderboardStore>;

beforeEach(() => {
    leaderboardStore = makeLeaderboardStore(new FakeStorageAdapter());
});

describe('addSession', () => {
    it('adds a session with a prefixed id and ISO date', () => {
        leaderboardStore.getState().addSession({ peak: 1500, endBalance: 1200 });

        const { sessions } = leaderboardStore.getState();
        expect(sessions).toHaveLength(1);
        const first = sessions[0];
        if (first === undefined) throw new Error('expected session at index 0');
        expect(first.id).toMatch(/^session-/);
        expect(first.date).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        expect(first.peak).toBe(1500);
        expect(first.endBalance).toBe(1200);
    });

    it('sorts sessions by peak balance descending', () => {
        leaderboardStore.getState().addSession({ peak: 1000, endBalance: 800 });
        leaderboardStore.getState().addSession({ peak: 2000, endBalance: 1500 });
        leaderboardStore.getState().addSession({ peak: 1500, endBalance: 1200 });

        const { sessions } = leaderboardStore.getState();
        const [first, second, third] = sessions;
        if (first === undefined || second === undefined || third === undefined)
            throw new Error('expected at least 3 sessions');
        expect(first.peak).toBe(2000);
        expect(second.peak).toBe(1500);
        expect(third.peak).toBe(1000);
    });

    it('retains at most 20 sessions', () => {
        for (let i = 0; i < 25; i++) {
            leaderboardStore.getState().addSession({ peak: 1000 + i, endBalance: 900 });
        }

        expect(leaderboardStore.getState().sessions).toHaveLength(20);
    });

    it('keeps the 20 highest-peak sessions when trimming', () => {
        for (let i = 0; i < 25; i++) {
            leaderboardStore.getState().addSession({ peak: 1000 + i, endBalance: 900 });
        }

        const last = leaderboardStore.getState().sessions.at(-1);
        if (last === undefined) throw new Error('expected at least one session');
        expect(last.peak).toBe(1005);
    });
});
