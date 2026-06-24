import type { makeLeaderboardStore } from './leaderboard-store';

type LeaderboardStoreDriver = {
    assert: {
        sessionCount: (store: ReturnType<typeof makeLeaderboardStore>, expected: number) => void;
        sessionIdPrefixed: (session: { id: string }) => void;
        sessionDateIsIso: (session: { date: string }) => void;
        sessionPeak: (session: { peak: number }, expected: number) => void;
        sessionEndBalance: (session: { endBalance: number }, expected: number) => void;
    };
};

export const makeLeaderboardStoreDriver = (): LeaderboardStoreDriver => ({
    assert: {
        sessionCount: (store, expected): void => {
            expect(store.getState().sessions).toHaveLength(expected);
        },
        sessionIdPrefixed: (session): void => {
            expect(session.id).toMatch(/^session-/);
        },
        sessionDateIsIso: (session): void => {
            expect(session.date).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        },
        sessionPeak: (session, expected): void => {
            expect(session.peak).toBe(expected);
        },
        sessionEndBalance: (session, expected): void => {
            expect(session.endBalance).toBe(expected);
        },
    },
});
