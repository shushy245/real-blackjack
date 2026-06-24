import type { makeGameStore } from './game-store';

type GameStoreDriver = {
    assert: {
        balance: (store: ReturnType<typeof makeGameStore>, expected: number) => void;
        roundDefined: (store: ReturnType<typeof makeGameStore>) => void;
        roundUndefined: (store: ReturnType<typeof makeGameStore>) => void;
    };
};

export const makeGameStoreDriver = (): GameStoreDriver => ({
    assert: {
        balance: (store, expected): void => {
            expect(store.getState().gameState.balance).toBe(expected);
        },
        roundDefined: (store): void => {
            expect(store.getState().gameState.round).toBeDefined();
        },
        roundUndefined: (store): void => {
            expect(store.getState().gameState.round).toBeUndefined();
        },
    },
});
