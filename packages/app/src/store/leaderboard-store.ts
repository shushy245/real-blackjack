import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Session = {
    readonly id: string;
    readonly date: string;
    readonly peak: number;
    readonly endBalance: number;
};

type LeaderboardStore = {
    readonly sessions: readonly Session[];
    addSession: (params: { peak: number; endBalance: number }) => void;
};

const MAX_SESSIONS = 20;

const storage = new MMKV({ id: 'leaderboard-store' });

const mmkvStorage = {
    // eslint-disable-next-line no-restricted-syntax
    getItem: (name: string): string | null => storage.getString(name) ?? null,
    setItem: (name: string, value: string): void => {
        storage.set(name, value);
    },
    removeItem: (name: string): void => {
        storage.delete(name);
    },
};

export const useLeaderboardStore = create<LeaderboardStore>()(
    persist(
        (set) => ({
            sessions: [],
            addSession: ({ peak, endBalance }) =>
                set((state) => {
                    const newSession: Session = {
                        id: `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
                        date: new Date().toISOString(),
                        peak,
                        endBalance,
                    };
                    const updated = [...state.sessions, newSession]
                        .sort((a, b) => b.peak - a.peak)
                        .slice(0, MAX_SESSIONS);

                    return { sessions: updated };
                }),
        }),
        {
            name: 'leaderboard-store',
            storage: createJSONStorage(() => mmkvStorage),
        },
    ),
);
