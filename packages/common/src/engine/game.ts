import { type Move } from './types';
import { settleRound } from './payouts';
import { type Rng, createRng } from './rng';
import { getLegalMoves as getRoundLegalMoves } from './legal-moves';
import { type Shoe, createShoe, needsReshuffle, reshuffleShoe } from './shoe';
import { type RoundState, createRound, applyRoundAction, runDealerTurn } from './round';

export type GameConfig = {
    readonly startingBalance: number;
    readonly minBet: number;
    readonly maxBet: number;
    readonly seed?: number;
};

export type GameState = {
    readonly balance: number;
    readonly sessionPeak: number;
    readonly shoe: Shoe;
    readonly round: RoundState | undefined;
    readonly rng: Rng;
    readonly config: GameConfig;
};

export type SolverState = Omit<GameState, 'rng'>;

export type PlaceBetAction = { type: 'PlaceBet'; amount: number };
export type PlayerMoveAction = { type: Move };
export type RunDealerTurnAction = { type: 'RunDealerTurn' };
export type CollectResultAction = { type: 'CollectResult' };

export type GameAction = PlaceBetAction | PlayerMoveAction | RunDealerTurnAction | CollectResultAction;

export const createGame = (config: GameConfig): GameState => {
    const rng = createRng(config.seed);
    const shoe = createShoe(rng);

    return {
        balance: config.startingBalance,
        sessionPeak: config.startingBalance,
        shoe,
        round: undefined,
        rng,
        config,
    };
};

const applyPlaceBet = (game: GameState, amount: number): GameState => {
    if (game.round !== undefined) throw new Error('applyAction: PlaceBet — a round is already in progress');
    if (amount < game.config.minBet)
        throw new Error(`applyAction: PlaceBet — bet ${amount} is below minimum ${game.config.minBet}`);
    if (amount > game.config.maxBet)
        throw new Error(`applyAction: PlaceBet — bet ${amount} exceeds maximum ${game.config.maxBet}`);
    if (amount > game.balance) throw new Error(`applyAction: PlaceBet — bet ${amount} exceeds balance ${game.balance}`);

    const shoe = needsReshuffle(game.shoe) ? reshuffleShoe(game.shoe, game.rng) : game.shoe;
    const balance = game.balance - amount;
    const round = createRound(amount, balance, shoe);

    return { ...game, shoe: round.shoe, balance, round };
};

const applyCollectResult = (game: GameState): GameState => {
    if (game.round === undefined) throw new Error('applyAction: CollectResult — no active round');
    if (game.round.phase !== 'settling') throw new Error('applyAction: CollectResult — round is not in settling phase');

    const { netDelta } = settleRound(game.round);
    const balance = game.balance + netDelta + game.round.originalBet;
    const sessionPeak = Math.max(game.sessionPeak, balance);

    return { ...game, balance, sessionPeak, round: undefined };
};

export const applyAction = (game: GameState, action: GameAction): GameState => {
    if (action.type === 'PlaceBet') return applyPlaceBet(game, action.amount);
    if (action.type === 'CollectResult') return applyCollectResult(game);
    if (action.type === 'RunDealerTurn') {
        if (game.round === undefined) throw new Error('applyAction: RunDealerTurn — no active round');

        return { ...game, round: runDealerTurn(game.round) };
    }

    if (game.round === undefined) throw new Error(`applyAction: ${action.type} — no active round`);
    const round = applyRoundAction(game.round, { type: action.type });

    return { ...game, round };
};

export const getState = (game: GameState): SolverState => {
    const { rng: _rng, ...rest } = game;

    return rest;
};

export const getLegalMoves = (game: GameState): Move[] => {
    if (game.round === undefined) return [];

    return getRoundLegalMoves(game.round);
};
