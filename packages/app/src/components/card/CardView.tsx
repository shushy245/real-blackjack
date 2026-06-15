import type { JSX } from 'react';
import { Rank } from '@real-blackjack/common';
import type { Card } from '@real-blackjack/common';
import { G, Rect, Svg, Text } from 'react-native-svg';

import { CARD_RATIO, isFaceOrAce, pipPositionMap, rankLabelMap, suitColorMap, suitSymbolMap } from './CardView.utils';

// Card viewport is 70×98. All SVG coordinates are in this space.
const W = 70;
const H = 98;
const CX = W / 2;
const CY = H / 2;

type CardViewProps = { card: Card; width?: number };

export const CardView = ({ card, width = 70 }: CardViewProps): JSX.Element => {
    const height = width * CARD_RATIO;
    const color = suitColorMap[card.suit];
    const rank = rankLabelMap[card.rank];
    const suit = suitSymbolMap[card.suit];

    return (
        <Svg width={width} height={height} viewBox={`0 0 ${W} ${H}`}>
            <CardBackground />
            <CornerLabel rank={rank} suit={suit} color={color} />
            <CenterContent rank={card.rank} suit={suit} color={color} />
            <G transform={`rotate(180, ${CX}, ${CY})`}>
                <CornerLabel rank={rank} suit={suit} color={color} />
            </G>
        </Svg>
    );
};

const CardBackground = (): JSX.Element => (
    <G>
        {/* Card stock */}
        <Rect width={W} height={H} rx={5} ry={5} fill="#FDFCF7" />
        {/* Outer edge shadow */}
        <Rect width={W} height={H} rx={5} ry={5} fill="none" stroke="#C8C4B0" strokeWidth={0.5} />
        {/* Gold inner border */}
        <Rect x={3} y={3} width={64} height={92} rx={3} ry={3} fill="none" stroke="#C4A44A" strokeWidth={0.6} />
    </G>
);

type CornerLabelProps = { rank: string; suit: string; color: string };

const CornerLabel = ({ rank, suit, color }: CornerLabelProps): JSX.Element => (
    <G>
        <Text
            x={7}
            y={18}
            fontSize={rank.length > 1 ? 11 : 13}
            fontFamily="Georgia, 'Times New Roman', serif"
            fontWeight="bold"
            fill={color}
        >
            {rank}
        </Text>
        <Text
            x={rank.length > 1 ? 8 : 7}
            y={28}
            fontSize={10}
            fontFamily="Georgia, 'Times New Roman', serif"
            fill={color}
        >
            {suit}
        </Text>
    </G>
);

type CenterContentProps = { rank: Rank; suit: string; color: string };

const CenterContent = ({ rank, suit, color }: CenterContentProps): JSX.Element => {
    if (isFaceOrAce(rank)) {
        return <FaceDisplay rank={rank} suit={suit} color={color} />;
    }

    const pips = pipPositionMap[rank];

    return (
        <G>
            {pips.map((pos, i) => (
                <Text
                    key={i}
                    x={pos.x}
                    y={pos.y}
                    fontSize={10}
                    fontFamily="Georgia, 'Times New Roman', serif"
                    fill={color}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                >
                    {suit}
                </Text>
            ))}
        </G>
    );
};

type FaceDisplayProps = { rank: Rank; suit: string; color: string };

const FaceDisplay = ({ rank, suit, color }: FaceDisplayProps): JSX.Element => {
    if (rank === Rank.Ace) {
        return (
            <G>
                {/* Large ornamental pip for Ace */}
                <Text
                    x={CX}
                    y={CY + 1}
                    fontSize={32}
                    fontFamily="Georgia, 'Times New Roman', serif"
                    fill={color}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                >
                    {suit}
                </Text>
            </G>
        );
    }

    const label = rankLabelMap[rank];

    return (
        <G>
            {/* Decorative frame for face cards */}
            <Rect
                x={14}
                y={34}
                width={42}
                height={30}
                rx={2}
                ry={2}
                fill="none"
                stroke={color}
                strokeWidth={0.4}
                opacity={0.3}
            />
            {/* Large rank letter */}
            <Text
                x={CX}
                y={CY - 1}
                fontSize={28}
                fontFamily="Georgia, 'Times New Roman', serif"
                fontWeight="bold"
                fontStyle="italic"
                fill={color}
                textAnchor="middle"
                alignmentBaseline="middle"
            >
                {label}
            </Text>
            {/* Small suit below letter */}
            <Text
                x={CX}
                y={CY + 16}
                fontSize={9}
                fontFamily="Georgia, 'Times New Roman', serif"
                fill={color}
                textAnchor="middle"
                alignmentBaseline="middle"
                opacity={0.7}
            >
                {suit}
            </Text>
        </G>
    );
};
