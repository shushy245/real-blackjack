import { create } from 'zustand';
import { generateUniqueId } from '@real-blackjack/common';
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
                            id: generateUniqueId('session'),
                            date: new Date().toISOString(),
                            peak,
                            endBalance,
                        };
                        const updated = [...state.sessions, newSession]
                            .sort((a, b) => b.peak - a.peak || (b.date > a.date ? 1 : b.date < a.date ? -1 : 0))
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
