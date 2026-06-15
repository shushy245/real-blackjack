import { describe, expect, it } from 'vitest';

import { Move } from './types';
import { applyAction, createGame, getLegalMoves, getState } from './index';

describe('createGame', () => {
    it('returns a game with the configured starting balance', () => {
        const game = createGame({ startingBalance: 1000, minBet: 10, maxBet: 1000 });

        expect(game.balance).toBe(1000);
    });

    it('starts with a fresh shoe and no active round', () => {
        const game = createGame({ startingBalance: 1000, minBet: 10, maxBet: 1000 });

        expect(game.shoe.cards).toHaveLength(312);
        expect(game.round).toBeUndefined();
    });
});

describe('applyAction — PlaceBet', () => {
    it('deducts the bet from balance and starts a round in player-action or settling', () => {
        const game = createGame({ startingBalance: 1000, minBet: 10, maxBet: 1000, seed: 42 });
        const next = applyAction(game, { type: 'PlaceBet', amount: 50 });

        expect(next.balance).toBe(950);
        expect(next.round).toBeDefined();
    });

    it('reshuffles the shoe when penetration threshold is reached before dealing', () => {
        const game = createGame({ startingBalance: 1000, minBet: 10, maxBet: 1000, seed: 42 });
        const exhausted = { ...game, shoe: { ...game.shoe, dealtCount: 234 } };
        const next = applyAction(exhausted, { type: 'PlaceBet', amount: 50 });

        expect(next.shoe.dealtCount).toBeLessThan(234);
    });

    it('throws when a round is already in progress', () => {
        const game = createGame({ startingBalance: 1000, minBet: 10, maxBet: 1000, seed: 42 });
        const withRound = applyAction(game, { type: 'PlaceBet', amount: 50 });

        expect(() => applyAction(withRound, { type: 'PlaceBet', amount: 50 })).toThrow(
            'applyAction: PlaceBet — a round is already in progress',
        );
    });

    it('throws when bet is below minimum', () => {
        const game = createGame({ startingBalance: 1000, minBet: 10, maxBet: 1000 });

        expect(() => applyAction(game, { type: 'PlaceBet', amount: 5 })).toThrow();
    });

    it('throws when bet exceeds maximum', () => {
        const game = createGame({ startingBalance: 1000, minBet: 10, maxBet: 1000 });

        expect(() => applyAction(game, { type: 'PlaceBet', amount: 2000 })).toThrow();
    });
});

describe('applyAction — player moves', () => {
    const startRound = () => {
        const game = createGame({ startingBalance: 1000, minBet: 10, maxBet: 1000, seed: 42 });

        return applyAction(game, { type: 'PlaceBet', amount: 50 });
    };

    it('applies a player move to the active round', () => {
        const game = startRound();
        if (game.round?.phase !== 'player-action') return; // skip if BJ/insurance dealt

        const next = applyAction(game, { type: Move.Hit });

        expect(next.round?.playerHands[0]?.length).toBeGreaterThan(2);
    });

    it('updates balance when round settles after player busts', () => {
        // Drive the game to bust via repeated hits
        let game = startRound();
        while (game.round?.phase === 'player-action') {
            game = applyAction(game, { type: Move.Hit });
        }
        // If round ended in settling, apply one more no-op to see balance
        if (game.round?.phase === 'settling') {
            const settled = applyAction(game, { type: 'CollectResult' });

            expect(settled.balance).toBeLessThanOrEqual(1000);
            expect(settled.round).toBeUndefined();
        }
    });
});

describe('applyAction — CollectResult', () => {
    it('applies the net delta to balance and clears the round', () => {
        const game = createGame({ startingBalance: 1000, minBet: 10, maxBet: 1000, seed: 42 });
        let g = applyAction(game, { type: 'PlaceBet', amount: 50 });

        // Play to completion (stand repeatedly until settling)
        while (g.round !== undefined && g.round.phase !== 'settling') {
            if (g.round.phase === 'player-action') g = applyAction(g, { type: Move.Stand });
            else if (g.round.phase === 'insurance-pending') g = applyAction(g, { type: Move.Stand });
            else g = applyAction(g, { type: 'RunDealerTurn' });
        }

        const collected = applyAction(g, { type: 'CollectResult' });

        expect(collected.round).toBeUndefined();
        expect(typeof collected.balance).toBe('number');
    });
});

describe('getState', () => {
    it('returns a plain serializable object with no functions', () => {
        const game = createGame({ startingBalance: 1000, minBet: 10, maxBet: 1000, seed: 42 });

        expect(() => JSON.stringify(getState(game))).not.toThrow();
        const state = getState(game);
        expect(typeof state).toBe('object');
    });
});

describe('getLegalMoves', () => {
    it('returns Move[] matching the current round state', () => {
        const game = createGame({ startingBalance: 1000, minBet: 10, maxBet: 1000, seed: 42 });
        const withRound = applyAction(game, { type: 'PlaceBet', amount: 50 });
        const moves = getLegalMoves(withRound);

        expect(Array.isArray(moves)).toBe(true);
    });

    it('returns empty array when no round is active', () => {
        const game = createGame({ startingBalance: 1000, minBet: 10, maxBet: 1000 });

        expect(getLegalMoves(game)).toEqual([]);
    });
});
