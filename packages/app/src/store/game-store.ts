import { create } from 'zustand';
import type { StoreApi, UseBoundStore } from 'zustand';
import { applyAction, createGame } from '@real-blackjack/common';
import type { GameAction, GameState } from '@real-blackjack/common';

import type { StoragePort } from './storage.port';

export const GAME_CONFIG = { startingBalance: 1000, minBet: 10 } as const;

export const BALANCE_KEY = 'game.balance';

export const isValidBalance = (n: number | undefined): n is number =>
    n !== undefined && Number.isFinite(n) && Number.isInteger(n) && n > 0;

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
    const startingBalance = isValidBalance(initialBalance) ? initialBalance : GAME_CONFIG.startingBalance;

    const store = create<GameStoreState>()((set, get) => {
        const endAndReset = (): void => {
            const { gameState } = get();
            onSessionEnd({ peak: gameState.sessionPeak, endBalance: gameState.balance });
            set({ gameState: createGame(GAME_CONFIG), lastBet: 0 });
        };

        return {
            gameState: createGame({ ...GAME_CONFIG, startingBalance }),
            lastBet: 0,

            action: (move: GameAction) => {
                set((state) => {
                    const afterMove = applyAction(state.gameState, move);
                    const round = afterMove.round;
                    const gameState =
                        round !== undefined && round.phase === 'dealer-turn'
                            ? applyAction(afterMove, { type: 'RunDealerTurn' })
                            : afterMove;

                    return { gameState, lastBet: move.type === 'PlaceBet' ? move.amount : state.lastBet };
                });
            },

            newGame: endAndReset,
            cashOut: endAndReset,
        };
    });

    store.subscribe((state, prevState) => {
        if (state.gameState.balance === prevState.gameState.balance) return;
        storage.setItem(BALANCE_KEY, state.gameState.balance.toString()).catch((err) => {
            // eslint-disable-next-line no-console
            console.error('game-store: failed to persist balance', err);
        });
    });

    return store;
};
