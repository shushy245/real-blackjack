import { create } from 'zustand';
import type { StoreApi, UseBoundStore } from 'zustand';
import { applyAction, createGame } from '@real-blackjack/common';
import type { GameAction, GameState } from '@real-blackjack/common';

import type { StoragePort } from './storage.port';

export const GAME_CONFIG = { startingBalance: 1000, minBet: 10, maxBet: 1000 } as const;

const BALANCE_KEY = 'game.balance';

type GameStoreState = {
    readonly gameState: GameState;
    readonly lastBet: number;
    action: (move: GameAction) => void;
    newGame: () => void;
    cashOut: () => void;
};

type GameStoreDeps = {
    storage: StoragePort;
    onSessionEnd: (params: { peak: number; endBalance: number }) => void;
};

export const makeGameStore = ({ storage, onSessionEnd }: GameStoreDeps): UseBoundStore<StoreApi<GameStoreState>> => {
    const store = create<GameStoreState>()((set, get) => ({
        gameState: createGame(GAME_CONFIG),
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
            onSessionEnd({ peak: gameState.sessionPeak, endBalance: gameState.balance });
            set({ gameState: createGame(GAME_CONFIG), lastBet: 0 });
        },
    }));

    storage.getItem(BALANCE_KEY).then((raw) => {
        if (raw === undefined) return;
        const parsed = parseInt(raw, 10);
        if (!Number.isFinite(parsed) || parsed < 0) return;
        store.setState({ gameState: createGame({ ...GAME_CONFIG, startingBalance: parsed }) });
    });

    store.subscribe((state) => {
        storage.setItem(BALANCE_KEY, state.gameState.balance.toString());
    });

    return store;
};
