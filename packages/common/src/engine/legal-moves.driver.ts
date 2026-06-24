import { expect } from 'vitest';

import type { Move } from './types';

type LegalMovesDriver = {
    assert: {
        contains: (moves: Move[], move: Move) => void;
        excludes: (moves: Move[], move: Move) => void;
        equals: (moves: Move[], expected: Move[]) => void;
    };
};

export const makeLegalMovesDriver = (): LegalMovesDriver => ({
    assert: {
        contains: (moves, move): void => {
            expect(moves).toContain(move);
        },
        excludes: (moves, move): void => {
            expect(moves).not.toContain(move);
        },
        equals: (moves, expected): void => {
            expect(moves).toEqual(expected);
        },
    },
});
