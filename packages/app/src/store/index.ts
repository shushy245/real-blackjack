import { MMKV } from 'react-native-mmkv';

import { BALANCE_KEY, makeGameStore } from './game-store';
import { makeLeaderboardStore } from './leaderboard-store';
import { MmkvStorageAdapter } from './mmkv-storage-adapter';

export { GAME_CONFIG } from './game-store';
export type { Session } from './leaderboard-store';

const mmkv = new MMKV({ id: 'real-blackjack' });
const storage = new MmkvStorageAdapter(mmkv);

const rawBalance = mmkv.getString(BALANCE_KEY);
const parsedBalance = rawBalance !== undefined ? parseInt(rawBalance, 10) : undefined;
const initialBalance =
    parsedBalance !== undefined && Number.isFinite(parsedBalance) && parsedBalance >= 0 ? parsedBalance : undefined;

export const useLeaderboardStore = makeLeaderboardStore(storage);

export const useGameStore = makeGameStore({
    storage,
    ...(initialBalance !== undefined && { initialBalance }),
    onSessionEnd: (params) => useLeaderboardStore.getState().addSession(params),
});
