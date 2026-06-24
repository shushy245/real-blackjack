import { useEffect } from 'react';
import type { JSX, ReactNode } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useSoundEffects } from '~/sounds';

type DealingCardProps = { children: ReactNode };

const SPRING_CONFIG = { damping: 16, stiffness: 260, mass: 0.8 };

export const DealingCard = ({ children }: DealingCardProps): JSX.Element => {
    const sounds = useSoundEffects();
    const opacity = useSharedValue(0);
    const translateX = useSharedValue(50);
    const translateY = useSharedValue(-50);

    useEffect(() => {
        sounds.deal();
        opacity.value = withSpring(1, SPRING_CONFIG);
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    }));

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};
