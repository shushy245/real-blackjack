import { MotiView } from 'moti';
import { useEffect } from 'react';
import type { JSX, ReactNode } from 'react';

import { useSoundEffects } from '~/sounds';

type DealingCardProps = { children: ReactNode };

export const DealingCard = ({ children }: DealingCardProps): JSX.Element => {
    const sounds = useSoundEffects();

    useEffect(() => {
        sounds.deal();
    }, []);

    return (
        <MotiView
            from={{ opacity: 0, translateX: 50, translateY: -50 }}
            animate={{ opacity: 1, translateX: 0, translateY: 0 }}
            transition={{ type: 'spring', damping: 16, stiffness: 260, mass: 0.8 }}
        >
            {children}
        </MotiView>
    );
};
