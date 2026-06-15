import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';
import { applyAction, createGame } from '@real-blackjack/common';
import type { GameAction, GameState } from '@real-blackjack/common';

import { useLeaderboardStore } from './leaderboard-store';

export const GAME_CONFIG = { startingBalance: 1000, minBet: 10, maxBet: 1000 } as const;

const BALANCE_KEY = 'game.balance';

const storage = new MMKV({ id: 'game-store' });

const readPersistedBalance = (): number => {
    const raw = storage.getString(BALANCE_KEY);
    if (raw === undefined) return GAME_CONFIG.startingBalance;
    const parsed = parseInt(raw, 10);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : GAME_CONFIG.startingBalance;
};

type GameStore = {
    readonly gameState: GameState;
    readonly lastBet: number;
    action: (move: GameAction) => void;
    newGame: () => void;
    cashOut: () => void;
};

export const useGameStore = create<GameStore>()((set, get) => ({
    gameState: createGame({ ...GAME_CONFIG, startingBalance: readPersistedBalance() }),
    lastBet: 0,

    action: (move: GameAction) =>
        set((state) => {
            let gameState = applyAction(state.gameState, move);
            if (gameState.round?.phase === 'dealer-turn') {
                gameState = applyAction(gameState, { type: 'RunDealerTurn' });
            }

            return {
                gameState,
                lastBet: move.type === 'PlaceBet' ? move.amount : state.lastBet,
            };
        }),

    newGame: () => set({ gameState: createGame(GAME_CONFIG), lastBet: 0 }),

    cashOut: () => {
        const { gameState } = get();
        useLeaderboardStore.getState().addSession({
            peak: gameState.sessionPeak,
            endBalance: gameState.balance,
        });
        set({ gameState: createGame(GAME_CONFIG), lastBet: 0 });
    },
}));

useGameStore.subscribe((state) => {
    storage.set(BALANCE_KEY, state.gameState.balance.toString());
});
