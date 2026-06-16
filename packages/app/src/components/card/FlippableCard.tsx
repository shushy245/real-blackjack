import { useEffect } from 'react';
import type { JSX, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

type FlippableCardProps = {
    front: ReactNode;
    back: ReactNode;
    flipped: boolean;
};

export const FlippableCard = ({ front, back, flipped }: FlippableCardProps): JSX.Element => {
    const progress = useSharedValue(flipped ? 1 : 0);

    useEffect(() => {
        if (flipped) {
            progress.value = withTiming(1, { duration: 450 });

            return;
        }
        progress.value = 0;
    }, [flipped, progress]);

    const backStyle = useAnimatedStyle(() => ({
        transform: [{ perspective: 1200 }, { rotateY: `${interpolate(progress.value, [0, 1], [0, Math.PI])}rad` }],
    }));

    const frontStyle = useAnimatedStyle(() => ({
        transform: [{ perspective: 1200 }, { rotateY: `${interpolate(progress.value, [0, 1], [-Math.PI, 0])}rad` }],
    }));

    return (
        <View>
            <Animated.View style={[styles.backFace, backStyle]}>{back}</Animated.View>
            <Animated.View style={[styles.frontFace, frontStyle]}>{front}</Animated.View>
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
        backfaceVisibility: 'hidden',
    },
    frontFace: {
        backfaceVisibility: 'hidden',
    },
});
