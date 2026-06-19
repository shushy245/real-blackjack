import { MMKV } from 'react-native-mmkv';
import constants, { ExecutionEnvironment } from 'expo-constants';

import type { StoragePort } from './storage.port';
import { makeLeaderboardStore } from './leaderboard-store';
import { MmkvStorageAdapter } from './mmkv-storage-adapter';
import { MemoryStorageAdapter } from './memory-storage-adapter';
import { BALANCE_KEY, isValidBalance, makeGameStore } from './game-store';

export { GAME_CONFIG } from './game-store';
export type { Session } from './leaderboard-store';

const makeStorageAndBalance = (): { storage: StoragePort; initialBalance: number | undefined } => {
    // Expo Go runs in a sandbox without native modules — use in-memory storage
    if (constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
        return { storage: new MemoryStorageAdapter(), initialBalance: undefined };
    }
    const mmkv = new MMKV({ id: 'real-blackjack' });
    const adapter = new MmkvStorageAdapter(mmkv);
    const rawBalance = adapter.readSync(BALANCE_KEY);
    const parsed = rawBalance !== undefined ? Number(rawBalance) : undefined;
    const initialBalance = isValidBalance(parsed) ? parsed : undefined;

    return { storage: adapter, initialBalance };
};

const { storage, initialBalance } = makeStorageAndBalance();

export const useLeaderboardStore = makeLeaderboardStore(storage);

export const useGameStore = makeGameStore({
    storage,
    ...(initialBalance !== undefined && { initialBalance }),
    onSessionEnd: (params) => useLeaderboardStore.getState().addSession(params),
});
