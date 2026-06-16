import { create } from 'zustand';
import type { Mutate, StoreApi, UseBoundStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { StoragePort } from './storage.port';

type LeaderboardStoreHook = UseBoundStore<Mutate<StoreApi<LeaderboardStoreState>, [['zustand/persist', unknown]]>>;

export type Session = {
    readonly id: string;
    readonly date: string;
    readonly peak: number;
    readonly endBalance: number;
};

type LeaderboardStoreState = {
    readonly sessions: readonly Session[];
    addSession: (params: { peak: number; endBalance: number }) => void;
};

const MAX_SESSIONS = 20;

export const makeLeaderboardStore = (storage: StoragePort): LeaderboardStoreHook => {
    const zustandStorage = {
        // Zustand's StateStorage requires null for missing keys — boundary exception
        // eslint-disable-next-line no-restricted-syntax
        getItem: async (key: string): Promise<string | null> => (await storage.getItem(key)) ?? null,
        setItem: (key: string, value: string) => storage.setItem(key, value),
        removeItem: (key: string) => storage.removeItem(key),
    };

    return create<LeaderboardStoreState>()(
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
                            .sort((a, b) => b.peak - a.peak || b.date.localeCompare(a.date))
                            .slice(0, MAX_SESSIONS);

                        return { sessions: updated };
                    }),
            }),
            {
                name: 'leaderboard-store',
                storage: createJSONStorage(() => zustandStorage),
            },
        ),
    );
};
