import { Rank, Suit, type Card } from '@real-blackjack/common';

import { cardImages } from './cardImages';

// Nicubunu ornamental PNGs render at 210×285 → ratio 285/210
export const CARD_RATIO = 285 / 210;

type CardImageTable = Record<Rank, Record<Suit, number>>;

const cardImageTable: CardImageTable = {
    [Rank.Ace]: {
        [Suit.Clubs]: cardImages.ace_clubs,
        [Suit.Diamonds]: cardImages.ace_diamonds,
        [Suit.Hearts]: cardImages.ace_hearts,
        [Suit.Spades]: cardImages.ace_spades,
    },
    [Rank.Two]: {
        [Suit.Clubs]: cardImages['2_clubs'],
        [Suit.Diamonds]: cardImages['2_diamonds'],
        [Suit.Hearts]: cardImages['2_hearts'],
        [Suit.Spades]: cardImages['2_spades'],
    },
    [Rank.Three]: {
        [Suit.Clubs]: cardImages['3_clubs'],
        [Suit.Diamonds]: cardImages['3_diamonds'],
        [Suit.Hearts]: cardImages['3_hearts'],
        [Suit.Spades]: cardImages['3_spades'],
    },
    [Rank.Four]: {
        [Suit.Clubs]: cardImages['4_clubs'],
        [Suit.Diamonds]: cardImages['4_diamonds'],
        [Suit.Hearts]: cardImages['4_hearts'],
        [Suit.Spades]: cardImages['4_spades'],
    },
    [Rank.Five]: {
        [Suit.Clubs]: cardImages['5_clubs'],
        [Suit.Diamonds]: cardImages['5_diamonds'],
        [Suit.Hearts]: cardImages['5_hearts'],
        [Suit.Spades]: cardImages['5_spades'],
    },
    [Rank.Six]: {
        [Suit.Clubs]: cardImages['6_clubs'],
        [Suit.Diamonds]: cardImages['6_diamonds'],
        [Suit.Hearts]: cardImages['6_hearts'],
        [Suit.Spades]: cardImages['6_spades'],
    },
    [Rank.Seven]: {
        [Suit.Clubs]: cardImages['7_clubs'],
        [Suit.Diamonds]: cardImages['7_diamonds'],
        [Suit.Hearts]: cardImages['7_hearts'],
        [Suit.Spades]: cardImages['7_spades'],
    },
    [Rank.Eight]: {
        [Suit.Clubs]: cardImages['8_clubs'],
        [Suit.Diamonds]: cardImages['8_diamonds'],
        [Suit.Hearts]: cardImages['8_hearts'],
        [Suit.Spades]: cardImages['8_spades'],
    },
    [Rank.Nine]: {
        [Suit.Clubs]: cardImages['9_clubs'],
        [Suit.Diamonds]: cardImages['9_diamonds'],
        [Suit.Hearts]: cardImages['9_hearts'],
        [Suit.Spades]: cardImages['9_spades'],
    },
    [Rank.Ten]: {
        [Suit.Clubs]: cardImages['10_clubs'],
        [Suit.Diamonds]: cardImages['10_diamonds'],
        [Suit.Hearts]: cardImages['10_hearts'],
        [Suit.Spades]: cardImages['10_spades'],
    },
    [Rank.Jack]: {
        [Suit.Clubs]: cardImages.jack_clubs,
        [Suit.Diamonds]: cardImages.jack_diamonds,
        [Suit.Hearts]: cardImages.jack_hearts,
        [Suit.Spades]: cardImages.jack_spades,
    },
    [Rank.Queen]: {
        [Suit.Clubs]: cardImages.queen_clubs,
        [Suit.Diamonds]: cardImages.queen_diamonds,
        [Suit.Hearts]: cardImages.queen_hearts,
        [Suit.Spades]: cardImages.queen_spades,
    },
    [Rank.King]: {
        [Suit.Clubs]: cardImages.king_clubs,
        [Suit.Diamonds]: cardImages.king_diamonds,
        [Suit.Hearts]: cardImages.king_hearts,
        [Suit.Spades]: cardImages.king_spades,
    },
};

export const getCardImage = (card: Card, face: 'up' | 'down'): number => {
    if (face === 'down') return cardImages.card_back;

    return cardImageTable[card.rank][card.suit];
};
