import { MMKV } from 'react-native-mmkv';
import constants, { ExecutionEnvironment } from 'expo-constants';

import type { StoragePort } from './storage.port';
import { BALANCE_KEY, makeGameStore } from './game-store';
import { makeLeaderboardStore } from './leaderboard-store';
import { MmkvStorageAdapter } from './mmkv-storage-adapter';
import { MemoryStorageAdapter } from './memory-storage-adapter';

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
    const parsed = rawBalance !== undefined ? parseInt(rawBalance, 10) : undefined;
    const initialBalance = parsed !== undefined && Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;

    return { storage: adapter, initialBalance };
};

const { storage, initialBalance } = makeStorageAndBalance();

export const useLeaderboardStore = makeLeaderboardStore(storage);

export const useGameStore = makeGameStore({
    storage,
    ...(initialBalance !== undefined && { initialBalance }),
    onSessionEnd: (params) => useLeaderboardStore.getState().addSession(params),
});
