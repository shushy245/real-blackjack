import { useCallback, useEffect, useRef } from 'react';
import type { RoundState } from '@real-blackjack/common';

import { AUTO_COLLECT_DELAY_MS } from '~/animations/constants';

export const useAutoCollect = (
    round: RoundState | undefined,
    onCollect: () => void,
): { onAllCardsVisible: () => void } => {
    const allCardsVisibleRef = useRef(false);
    const onCollectRef = useRef(onCollect);
    onCollectRef.current = onCollect;
    const collectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const scheduleCollect = useCallback((): void => {
        clearTimeout(collectTimerRef.current);
        collectTimerRef.current = setTimeout(() => {
            onCollectRef.current();
        }, AUTO_COLLECT_DELAY_MS);
    }, []);

    const onAllCardsVisible = useCallback((): void => {
        allCardsVisibleRef.current = true;
        if (round === undefined) return;
        if (round.phase !== 'settling') return;
        scheduleCollect();
    }, [round, scheduleCollect]);

    useEffect(() => {
        if (round === undefined) {
            allCardsVisibleRef.current = false;
            clearTimeout(collectTimerRef.current);

            return;
        }
        if (round.phase !== 'settling') return;
        if (!allCardsVisibleRef.current) return;
        scheduleCollect();
    }, [round, scheduleCollect]);

    return { onAllCardsVisible };
};
