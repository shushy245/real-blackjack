import type { JSX } from 'react';
import { Image } from 'react-native';
import type { Card } from '@real-blackjack/common';

import { CARD_RATIO, getCardImage } from './CardView.utils';

type CardViewProps = { card: Card; face?: 'up' | 'down'; width?: number };

export const CardView = ({ card, face = 'up', width = 70 }: CardViewProps): JSX.Element => {
    const height = width * CARD_RATIO;

    return <Image source={getCardImage(card, face)} style={{ width, height }} resizeMode="contain" />;
};
