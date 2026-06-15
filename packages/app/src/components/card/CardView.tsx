import type { JSX } from 'react';
import { Rank } from '@real-blackjack/common';
import type { Card } from '@real-blackjack/common';
import { Defs, G, Path, Pattern, Rect, Svg, Text } from 'react-native-svg';

import {
    CARD_RATIO,
    GOLD,
    NAVY,
    isFaceOrAce,
    pipPositionMap,
    rankLabelMap,
    suitColorMap,
    suitSymbolMap,
} from './CardView.utils';

// Card viewport is 70×98. All SVG coordinates are in this space.
const W = 70;
const H = 98;
const CX = W / 2;
const CY = H / 2;

type CardViewProps = { card: Card; face?: 'up' | 'down'; width?: number };

export const CardView = ({ card, face = 'up', width = 70 }: CardViewProps): JSX.Element => {
    const height = width * CARD_RATIO;

    if (face === 'down') {
        return (
            <Svg width={width} height={height} viewBox={`0 0 ${W} ${H}`}>
                <CardBack />
            </Svg>
        );
    }

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

// Diagonal gold trellis on deep navy — classic casino card back
const CardBack = (): JSX.Element => (
    <G>
        <Defs>
            <Pattern id="trellis" x={0} y={0} width={8} height={8} patternUnits="userSpaceOnUse">
                <Path d="M0,8 L8,0" stroke={GOLD} strokeWidth={0.55} opacity={0.38} />
                <Path d="M0,0 L8,8" stroke={GOLD} strokeWidth={0.55} opacity={0.38} />
            </Pattern>
        </Defs>
        {/* Navy base */}
        <Rect width={W} height={H} rx={5} ry={5} fill={NAVY} />
        {/* Trellis overlay */}
        <Rect width={W} height={H} rx={5} ry={5} fill="url(#trellis)" />
        {/* Outer gold edge */}
        <Rect width={W} height={H} rx={5} ry={5} fill="none" stroke={GOLD} strokeWidth={0.8} />
        {/* Outer frame line */}
        <Rect x={3} y={3} width={64} height={92} rx={3} ry={3} fill="none" stroke={GOLD} strokeWidth={0.6} />
        {/* Inner frame line — double-border effect */}
        <Rect
            x={6}
            y={6}
            width={58}
            height={86}
            rx={2}
            ry={2}
            fill="none"
            stroke={GOLD}
            strokeWidth={0.35}
            opacity={0.55}
        />
        {/* Centre diamond ornament */}
        <Path d={`M${CX},${CY - 9} L${CX + 6},${CY} L${CX},${CY + 9} L${CX - 6},${CY} Z`} fill={GOLD} />
        {/* Short axis arms — Art Deco cross-hair detail */}
        <Path d={`M${CX - 13},${CY} L${CX - 7},${CY}`} stroke={GOLD} strokeWidth={0.7} />
        <Path d={`M${CX + 7},${CY} L${CX + 13},${CY}`} stroke={GOLD} strokeWidth={0.7} />
        <Path d={`M${CX},${CY - 14} L${CX},${CY - 10}`} stroke={GOLD} strokeWidth={0.7} />
        <Path d={`M${CX},${CY + 10} L${CX},${CY + 14}`} stroke={GOLD} strokeWidth={0.7} />
        {/* Tiny corner diamonds */}
        <Path d={`M10,10 L13,13 L10,16 L7,13 Z`} fill={GOLD} opacity={0.6} />
        <Path d={`M60,10 L63,13 L60,16 L57,13 Z`} fill={GOLD} opacity={0.6} />
        <Path d={`M10,82 L13,85 L10,88 L7,85 Z`} fill={GOLD} opacity={0.6} />
        <Path d={`M60,82 L63,85 L60,88 L57,85 Z`} fill={GOLD} opacity={0.6} />
    </G>
);

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
