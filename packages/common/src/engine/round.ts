import { Hand } from './hand';
import { shouldDealerHit } from './dealer';
import { type Shoe, dealCard } from './shoe';
import { getLegalMoves } from './legal-moves';
import { Move, Rank, type Card } from './types';

export type RoundPhase = 'player-action' | 'insurance-pending' | 'dealer-turn' | 'settling';

export type RoundState = {
    readonly phase: RoundPhase;
    readonly shoe: Shoe;
    readonly playerHands: readonly Hand[];
    readonly dealerHand: Hand;
    readonly holeCardRevealed: boolean;
    readonly activeHandIndex: number;
    readonly originalBet: number;
    readonly activeBet: number;
    readonly handBets: readonly number[];
    readonly balance: number;
    readonly insuranceBet: number | undefined;
    readonly insuranceTaken: boolean;
    readonly splitOccurred: boolean;
};

export type PlayerAction = { type: Move };

const TEN_VALUE_RANKS = new Set<Rank>([Rank.Ten, Rank.Jack, Rank.Queen, Rank.King]);

const resolveInitialPhase = (
    playerHand: Hand,
    dealerUpCard: Card,
    dealerHoleCard: Card,
): { phase: RoundPhase; holeCardRevealed: boolean } => {
    const playerBJ = playerHand.isBlackjack();
    const dealerUpIsAce = dealerUpCard.rank === Rank.Ace;
    const dealerUpIsTenValue = TEN_VALUE_RANKS.has(dealerUpCard.rank);

    // Dealer shows Ace: always offer insurance first, regardless of hole card
    if (dealerUpIsAce) return { phase: 'insurance-pending', holeCardRevealed: false };

    if (dealerUpIsTenValue) {
        const dealerBJ = dealerHoleCard.rank === Rank.Ace;
        if (dealerBJ) return { phase: 'settling', holeCardRevealed: true };
    }

    if (playerBJ) return { phase: 'settling', holeCardRevealed: true };

    return { phase: 'player-action', holeCardRevealed: false };
};

export const createRound = (bet: number, balance: number, shoe: Shoe): RoundState => {
    const [p1, shoe1] = dealCard(shoe);
    const [d1, shoe2] = dealCard(shoe1);
    const [p2, shoe3] = dealCard(shoe2);
    const [d2, shoe4] = dealCard(shoe3);

    const playerHand = Hand.of([p1, p2]);
    const dealerHand = Hand.of([d1, d2]);

    const { phase, holeCardRevealed } = resolveInitialPhase(playerHand, d1, d2);

    return {
        phase,
        shoe: shoe4,
        playerHands: [playerHand],
        dealerHand,
        holeCardRevealed,
        activeHandIndex: 0,
        originalBet: bet,
        activeBet: bet,
        handBets: [bet],
        balance,
        insuranceBet: undefined,
        insuranceTaken: false,
        splitOccurred: false,
    };
};

const advanceActiveHand = (state: RoundState): RoundState => {
    const nextIndex = state.activeHandIndex + 1;
    if (nextIndex < state.playerHands.length)
        return { ...state, activeHandIndex: nextIndex, activeBet: state.originalBet };

    return { ...state, phase: 'dealer-turn' };
};

const applyHit = (state: RoundState): RoundState => {
    const activeHand = state.playerHands[state.activeHandIndex];
    if (activeHand === undefined) throw new Error(`applyRoundAction: no active hand at index ${state.activeHandIndex}`);

    const [newCard, newShoe] = dealCard(state.shoe);
    const newHand = activeHand.add(newCard);
    const newHands = state.playerHands.map((h, i) => (i === state.activeHandIndex ? newHand : h));
    const updated: RoundState = { ...state, shoe: newShoe, playerHands: newHands };

    if (newHand.value().value >= 21) return advanceActiveHand(updated);

    return updated;
};

const applyStand = (state: RoundState): RoundState => advanceActiveHand(state);

const applyDouble = (state: RoundState): RoundState => {
    const activeHand = state.playerHands[state.activeHandIndex];
    if (activeHand === undefined) throw new Error(`applyRoundAction: no active hand at index ${state.activeHandIndex}`);

    const [newCard, newShoe] = dealCard(state.shoe);
    const newHand = activeHand.add(newCard);
    const newHands = state.playerHands.map((h, i) => (i === state.activeHandIndex ? newHand : h));
    const doubledBet = state.activeBet * 2;
    const newHandBets = state.handBets.map((b, i) => (i === state.activeHandIndex ? doubledBet : b));
    const updated: RoundState = {
        ...state,
        shoe: newShoe,
        playerHands: newHands,
        activeBet: doubledBet,
        handBets: newHandBets,
        balance: state.balance - state.activeBet,
    };

    return advanceActiveHand(updated);
};

const applySplit = (state: RoundState): RoundState => {
    const activeHand = state.playerHands[state.activeHandIndex];
    if (activeHand === undefined) throw new Error(`applyRoundAction: no active hand at index ${state.activeHandIndex}`);

    const c1 = activeHand.cards[0];
    const c2 = activeHand.cards[1];
    if (c1 === undefined || c2 === undefined) throw new Error('applyRoundAction: split requires exactly 2 cards');

    const [card1, shoe1] = dealCard(state.shoe);
    const [card2, shoe2] = dealCard(shoe1);

    const hand1 = Hand.of([c1, card1]);
    const hand2 = Hand.of([c2, card2]);

    const newHands = [
        ...state.playerHands.slice(0, state.activeHandIndex),
        hand1,
        hand2,
        ...state.playerHands.slice(state.activeHandIndex + 1),
    ];

    const newHandBets = [
        ...state.handBets.slice(0, state.activeHandIndex),
        state.originalBet,
        state.originalBet,
        ...state.handBets.slice(state.activeHandIndex + 1),
    ];

    return {
        ...state,
        shoe: shoe2,
        playerHands: newHands,
        handBets: newHandBets,
        balance: state.balance - state.originalBet,
        splitOccurred: true,
    };
};

const applyInsurancePending = (state: RoundState, action: PlayerAction): RoundState => {
    const dealerHasBJ = state.dealerHand.isBlackjack();

    if (action.type === Move.Insurance) {
        const insuranceBet = Math.floor(state.originalBet / 2);
        const base: RoundState = {
            ...state,
            insuranceBet,
            balance: state.balance - insuranceBet,
            insuranceTaken: true,
        };

        if (dealerHasBJ) return { ...base, phase: 'settling', holeCardRevealed: true };

        return { ...base, phase: 'player-action' };
    }

    if (action.type === Move.Stand) {
        if (dealerHasBJ) return { ...state, phase: 'settling', holeCardRevealed: true, insuranceTaken: true };

        return { ...state, phase: 'player-action', insuranceTaken: true };
    }

    throw new Error(`applyRoundAction: ${action.type} is not legal in phase insurance-pending`);
};

const actionHandlerMap: Partial<Record<Move, (state: RoundState) => RoundState>> = {
    [Move.Hit]: applyHit,
    [Move.Stand]: applyStand,
    [Move.Double]: applyDouble,
    [Move.Split]: applySplit,
};

export const applyRoundAction = (state: RoundState, action: PlayerAction): RoundState => {
    if (state.phase === 'insurance-pending') return applyInsurancePending(state, action);

    const legalMoves = getLegalMoves(state);
    if (!legalMoves.includes(action.type))
        throw new Error(`applyRoundAction: ${action.type} is not legal in phase ${state.phase}`);

    const handler = actionHandlerMap[action.type];
    if (handler === undefined) throw new Error(`applyRoundAction: unhandled move ${action.type}`);

    return handler(state);
};

const dealUntilStand = (hand: Hand, shoe: Shoe): { hand: Hand; shoe: Shoe } => {
    if (!shouldDealerHit(hand.value())) return { hand, shoe };
    const [newCard, newShoe] = dealCard(shoe);

    return dealUntilStand(hand.add(newCard), newShoe);
};

export const runDealerTurn = (state: RoundState): RoundState => {
    if (state.phase !== 'dealer-turn') throw new Error(`runDealerTurn: expected dealer-turn phase, got ${state.phase}`);

    const { hand: dealerHand, shoe } = dealUntilStand(state.dealerHand, state.shoe);

    return { ...state, dealerHand, shoe, holeCardRevealed: true, phase: 'settling' };
};
