import { useEffect, useRef } from 'react';
import type { JSX, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useSoundEffects } from '~/sounds';

import { isFlipBackFace } from './FlippableCard.utils';
import { FLIP_DURATION_MS } from '../../animations/constants';

type FlippableCardProps = {
    front: ReactNode;
    back: ReactNode;
    flipped: boolean;
};

export const FlippableCard = ({ front, back, flipped }: FlippableCardProps): JSX.Element => {
    const progress = useSharedValue(flipped ? 1 : 0);
    const sounds = useSoundEffects();
    const prevFlippedRef = useRef(flipped);

    useEffect(() => {
        const prev = prevFlippedRef.current;
        prevFlippedRef.current = flipped;
        if (prev === flipped) return;
        if (flipped) {
            sounds.flip();
            progress.value = withTiming(1, { duration: FLIP_DURATION_MS });

            return;
        }
        progress.value = 0;
    }, [flipped, progress, sounds]);

    const backStyle = useAnimatedStyle(() => ({
        opacity: isFlipBackFace(progress.value) ? 1 : 0,
        transform: [{ perspective: 1200 }, { rotateY: `${interpolate(progress.value, [0, 1], [0, Math.PI])}rad` }],
    }));

    const frontStyle = useAnimatedStyle(() => ({
        opacity: isFlipBackFace(progress.value) ? 0 : 1,
        transform: [{ perspective: 1200 }, { rotateY: `${interpolate(progress.value, [0, 1], [-Math.PI, 0])}rad` }],
    }));

    return (
        <View>
            <Animated.View style={[styles.backFace, backStyle]}>{back}</Animated.View>
            <Animated.View style={frontStyle}>{front}</Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    backFace: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});
