import { makeGameStore } from './game-store';
import { makeLeaderboardStore } from './leaderboard-store';
import { AsyncStorageAdapter } from './async-storage-adapter';

export { GAME_CONFIG } from './game-store';
export type { Session } from './leaderboard-store';

const storage = new AsyncStorageAdapter();

export const useLeaderboardStore = makeLeaderboardStore(storage);

export const useGameStore = makeGameStore({
    storage,
    onSessionEnd: (params) => useLeaderboardStore.getState().addSession(params),
});
