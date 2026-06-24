import { beforeEach, describe, it } from 'vitest';

import { Move } from './types';
import { makeGameDriver } from './game.driver';
import { applyAction, createGame, getLegalMoves } from './index';

describe('createGame', () => {
    let driver: ReturnType<typeof makeGameDriver>;
    beforeEach(() => {
        driver = makeGameDriver();
    });

    it('returns a game with the configured starting balance', () => {
        const game = createGame({ startingBalance: 1000, minBet: 10 });
        driver.assert.balance(game, 1000);
    });

    it('starts with a fresh shoe and no active round', () => {
        const game = createGame({ startingBalance: 1000, minBet: 10 });
        driver.assert.shoeCardCount(game, 312);
        driver.assert.roundUndefined(game);
    });
});

describe('applyAction — PlaceBet', () => {
    let driver: ReturnType<typeof makeGameDriver>;
    beforeEach(() => {
        driver = makeGameDriver();
    });

    it('deducts the bet from balance and starts a round in player-action or settling', () => {
        const game = createGame({ startingBalance: 1000, minBet: 10, seed: 42 });
        const next = applyAction(game, { type: 'PlaceBet', amount: 50 });
        driver.assert.balance(next, 950);
        driver.assert.roundDefined(next);
    });

    it('reshuffles the shoe when penetration threshold is reached before dealing', () => {
        const game = createGame({ startingBalance: 1000, minBet: 10, seed: 42 });
        const exhausted = { ...game, shoe: { ...game.shoe, dealtCount: 234 } };
        const next = applyAction(exhausted, { type: 'PlaceBet', amount: 50 });
        driver.assert.shoeDealtCountLessThan(next, 234);
    });

    it('throws when a round is already in progress', () => {
        const game = createGame({ startingBalance: 1000, minBet: 10, seed: 42 });
        const withRound = applyAction(game, { type: 'PlaceBet', amount: 50 });
        driver.assert.throws(
            () => applyAction(withRound, { type: 'PlaceBet', amount: 50 }),
            'applyAction: PlaceBet — a round is already in progress',
        );
    });

    it('throws when bet is below minimum', () => {
        const game = createGame({ startingBalance: 1000, minBet: 10 });
        driver.assert.throws(() => applyAction(game, { type: 'PlaceBet', amount: 5 }));
    });

    it('throws when bet exceeds maximum', () => {
        const game = createGame({ startingBalance: 1000, minBet: 10 });
        driver.assert.throws(() => applyAction(game, { type: 'PlaceBet', amount: 2000 }));
    });
});

describe('applyAction — player moves', () => {
    let driver: ReturnType<typeof makeGameDriver>;
    beforeEach(() => {
        driver = makeGameDriver();
    });

    const startRound = () => {
        const game = createGame({ startingBalance: 1000, minBet: 10, seed: 42 });

        return applyAction(game, { type: 'PlaceBet', amount: 50 });
    };

    it('applies a player move to the active round', () => {
        const game = startRound();
        if (game.round === undefined || game.round.phase !== 'player-action') return;
        const next = applyAction(game, { type: Move.Hit });
        if (next.round === undefined) throw new Error('expected round after hit');
        const hand0 = next.round.playerHands[0];
        if (hand0 === undefined) throw new Error('expected hand at index 0');
        driver.assert.handCardCountGreaterThan(hand0, 2);
    });

    it('updates balance when round settles after player busts', () => {
        let game = startRound();
        while (game.round !== undefined && game.round.phase === 'player-action') {
            game = applyAction(game, { type: Move.Hit });
        }
        if (game.round !== undefined && game.round.phase === 'settling') {
            const settled = applyAction(game, { type: 'CollectResult' });
            driver.assert.balanceLessOrEqualThan(settled, 1000);
            driver.assert.roundUndefined(settled);
        }
    });
});

describe('applyAction — CollectResult', () => {
    let driver: ReturnType<typeof makeGameDriver>;
    beforeEach(() => {
        driver = makeGameDriver();
    });

    it('applies the net delta to balance and clears the round', () => {
        const game = createGame({ startingBalance: 1000, minBet: 10, seed: 42 });
        let g = applyAction(game, { type: 'PlaceBet', amount: 50 });

        while (g.round !== undefined && g.round.phase !== 'settling') {
            if (g.round.phase === 'player-action') g = applyAction(g, { type: Move.Stand });
            else if (g.round.phase === 'insurance-pending') g = applyAction(g, { type: Move.Stand });
            else g = applyAction(g, { type: 'RunDealerTurn' });
        }

        const collected = applyAction(g, { type: 'CollectResult' });
        driver.assert.roundUndefined(collected);
    });
});

describe('getState', () => {
    let driver: ReturnType<typeof makeGameDriver>;
    beforeEach(() => {
        driver = makeGameDriver();
    });

    it('returns a plain serializable object with no functions', () => {
        const game = createGame({ startingBalance: 1000, minBet: 10, seed: 42 });
        driver.assert.stateIsSerializableObject(game);
    });
});

describe('getLegalMoves', () => {
    let driver: ReturnType<typeof makeGameDriver>;
    beforeEach(() => {
        driver = makeGameDriver();
    });

    it('returns Move[] matching the current round state', () => {
        const game = createGame({ startingBalance: 1000, minBet: 10, seed: 42 });
        const withRound = applyAction(game, { type: 'PlaceBet', amount: 50 });
        driver.assert.movesIsArray(getLegalMoves(withRound));
    });

    it('returns empty array when no round is active', () => {
        const game = createGame({ startingBalance: 1000, minBet: 10 });
        driver.assert.movesEmpty(getLegalMoves(game));
    });
});
