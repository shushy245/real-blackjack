import { useLeaderboardStore } from './leaderboard-store';
import { clearAllMMKVStores } from '../../__mocks__/react-native-mmkv';

beforeEach(() => {
    clearAllMMKVStores();
    useLeaderboardStore.setState({ sessions: [] });
});

describe('addSession', () => {
    it('adds a session with a prefixed id and ISO date', () => {
        useLeaderboardStore.getState().addSession({ peak: 1500, endBalance: 1200 });

        const { sessions } = useLeaderboardStore.getState();
        expect(sessions).toHaveLength(1);
        expect(sessions[0]?.id).toMatch(/^session-/);
        expect(sessions[0]?.date).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        expect(sessions[0]?.peak).toBe(1500);
        expect(sessions[0]?.endBalance).toBe(1200);
    });

    it('sorts sessions by peak balance descending', () => {
        useLeaderboardStore.getState().addSession({ peak: 1000, endBalance: 800 });
        useLeaderboardStore.getState().addSession({ peak: 2000, endBalance: 1500 });
        useLeaderboardStore.getState().addSession({ peak: 1500, endBalance: 1200 });

        const { sessions } = useLeaderboardStore.getState();
        expect(sessions[0]?.peak).toBe(2000);
        expect(sessions[1]?.peak).toBe(1500);
        expect(sessions[2]?.peak).toBe(1000);
    });

    it('retains at most 20 sessions', () => {
        for (let i = 0; i < 25; i++) {
            useLeaderboardStore.getState().addSession({ peak: 1000 + i, endBalance: 900 });
        }

        expect(useLeaderboardStore.getState().sessions).toHaveLength(20);
    });

    it('keeps the 20 highest-peak sessions when trimming', () => {
        for (let i = 0; i < 25; i++) {
            useLeaderboardStore.getState().addSession({ peak: 1000 + i, endBalance: 900 });
        }

        // peaks 1000–1024 added; top 20 are 1005–1024
        expect(useLeaderboardStore.getState().sessions.at(-1)?.peak).toBe(1005);
    });
});
