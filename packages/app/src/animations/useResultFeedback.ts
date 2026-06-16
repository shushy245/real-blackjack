import { useEffect, useRef } from 'react';
import type { ViewStyle } from 'react-native';
import { settleRound } from '@real-blackjack/common';
import type { RoundState } from '@real-blackjack/common';
import type { AnimatedStyle } from 'react-native-reanimated';
import { useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';

import { FLIP_DURATION_MS } from '../components/card/FlippableCard';

type ResultFeedbackStyles = {
    winFlashStyle: AnimatedStyle<ViewStyle>;
    bustFlashStyle: AnimatedStyle<ViewStyle>;
};

const FLASH_IN_MS = 200;
const FLASH_OUT_MS = 800;
const FLASH_OPACITY = 0.35;

const buildFlashAnimation = () =>
    withDelay(
        FLIP_DURATION_MS,
        withSequence(withTiming(FLASH_OPACITY, { duration: FLASH_IN_MS }), withTiming(0, { duration: FLASH_OUT_MS })),
    );

export const useResultFeedback = (round: RoundState | undefined): ResultFeedbackStyles => {
    const prevPhaseRef = useRef(round?.phase);
    const winFlash = useSharedValue(0);
    const bustFlash = useSharedValue(0);

    useEffect(() => {
        const phase = round?.phase;
        const prevPhase = prevPhaseRef.current;
        prevPhaseRef.current = phase;

        if (prevPhase === 'settling' && phase !== 'settling') {
            winFlash.value = 0;
            bustFlash.value = 0;

            return;
        }

        if (phase !== 'settling' || prevPhase === 'settling' || round === undefined) {
            return;
        }

        const { netDelta } = settleRound(round);

        if (netDelta > 0) {
            winFlash.value = buildFlashAnimation();
        } else if (netDelta < 0) {
            bustFlash.value = buildFlashAnimation();
        }
    }, [round]);

    const winFlashStyle = useAnimatedStyle(() => ({ opacity: winFlash.value }));
    const bustFlashStyle = useAnimatedStyle(() => ({ opacity: bustFlash.value }));

    return { winFlashStyle, bustFlashStyle };
};
