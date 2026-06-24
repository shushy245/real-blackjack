import { expect } from 'vitest';

import { getState } from './game';
import type { Hand } from './hand';
import type { GameState, Move } from './index';

type GameDriver = {
    assert: {
        balance: (game: GameState, expected: number) => void;
        shoeCardCount: (game: GameState, expected: number) => void;
        roundDefined: (game: GameState) => void;
        roundUndefined: (game: GameState) => void;
        shoeDealtCountLessThan: (game: GameState, threshold: number) => void;
        throws: (fn: () => unknown, message?: string) => void;
        handCardCountGreaterThan: (hand: Hand, expected: number) => void;
        balanceLessOrEqualThan: (game: GameState, amount: number) => void;
        movesIsArray: (moves: Move[]) => void;
        movesEmpty: (moves: Move[]) => void;
        stateIsSerializableObject: (game: GameState) => void;
    };
};

export const makeGameDriver = (): GameDriver => ({
    assert: {
        balance: (game, expected): void => {
            expect(game.balance).toBe(expected);
        },
        shoeCardCount: (game, expected): void => {
            expect(game.shoe.cards).toHaveLength(expected);
        },
        roundDefined: (game): void => {
            expect(game.round).toBeDefined();
        },
        roundUndefined: (game): void => {
            expect(game.round).toBeUndefined();
        },
        shoeDealtCountLessThan: (game, threshold): void => {
            expect(game.shoe.dealtCount).toBeLessThan(threshold);
        },
        throws: (fn, message): void => {
            if (message !== undefined) {
                expect(fn).toThrow(message);
            } else {
                expect(fn).toThrow();
            }
        },
        handCardCountGreaterThan: (hand, expected): void => {
            expect(hand.cards.length).toBeGreaterThan(expected);
        },
        balanceLessOrEqualThan: (game, amount): void => {
            expect(game.balance).toBeLessThanOrEqual(amount);
        },
        movesIsArray: (moves): void => {
            expect(Array.isArray(moves)).toBe(true);
        },
        movesEmpty: (moves): void => {
            expect(moves).toEqual([]);
        },
        stateIsSerializableObject: (game): void => {
            expect(() => JSON.stringify(getState(game))).not.toThrow();
            expect(typeof getState(game)).toBe('object');
        },
    },
});
