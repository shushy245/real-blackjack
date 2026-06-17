import { create } from 'zustand';
import type { StoreApi, UseBoundStore } from 'zustand';
import { applyAction, createGame } from '@real-blackjack/common';
import type { GameAction, GameState } from '@real-blackjack/common';

import type { StoragePort } from './storage.port';

export const GAME_CONFIG = { startingBalance: 1000, minBet: 10, maxBet: 1000 } as const;

export const BALANCE_KEY = 'game.balance';

type GameStoreState = {
    readonly gameState: GameState;
    readonly lastBet: number;
    action: (move: GameAction) => void;
    newGame: () => void;
    cashOut: () => void;
};

type GameStoreDeps = {
    storage: StoragePort;
    initialBalance?: number;
    onSessionEnd: (params: { peak: number; endBalance: number }) => void;
};

export const makeGameStore = ({
    storage,
    initialBalance,
    onSessionEnd,
}: GameStoreDeps): UseBoundStore<StoreApi<GameStoreState>> => {
    const startingBalance = initialBalance ?? GAME_CONFIG.startingBalance;

    const store = create<GameStoreState>()((set, get) => ({
        gameState: createGame({ ...GAME_CONFIG, startingBalance }),
        lastBet: 0,

        action: (move: GameAction) =>
            set((state) => {
                const afterMove = applyAction(state.gameState, move);
                const gameState =
                    afterMove.round?.phase === 'dealer-turn'
                        ? applyAction(afterMove, { type: 'RunDealerTurn' })
                        : afterMove;

                return { gameState, lastBet: move.type === 'PlaceBet' ? move.amount : state.lastBet };
            }),

        newGame: () => set({ gameState: createGame(GAME_CONFIG), lastBet: 0 }),

        cashOut: () => {
            const { gameState } = get();
            onSessionEnd({ peak: gameState.sessionPeak, endBalance: gameState.balance });
            set({ gameState: createGame(GAME_CONFIG), lastBet: 0 });
        },
    }));

    store.subscribe((state) => {
        storage.setItem(BALANCE_KEY, state.gameState.balance.toString()).catch((err) => {
            // eslint-disable-next-line no-console
            console.error('game-store: failed to persist balance', err);
        });
    });

    return store;
};
