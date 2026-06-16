import { MotiView } from 'moti';
import type { JSX, ReactNode } from 'react';

type DealingCardProps = { children: ReactNode };

export const DealingCard = ({ children }: DealingCardProps): JSX.Element => (
    <MotiView
        from={{ opacity: 0, translateX: 50, translateY: -50 }}
        animate={{ opacity: 1, translateX: 0, translateY: 0 }}
        transition={{ type: 'spring', damping: 16, stiffness: 260, mass: 0.8 }}
    >
        {children}
    </MotiView>
);
