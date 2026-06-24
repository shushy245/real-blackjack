import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { DealingCard } from './DealingCard';

jest.mock('~/sounds', () => ({
    useSoundEffects: jest.fn(),
}));

// Import after mock declaration so Jest resolves to the mocked module
// eslint-disable-next-line import/order
import { useSoundEffects } from '~/sounds';

const CHILD_TEST_ID = 'DealingCardDriverChild';

class DealingCardDriver {
    private readonly _mockDeal = jest.fn();

    constructor() {
        jest.mocked(useSoundEffects).mockReturnValue({
            deal: this._mockDeal,
            flip: jest.fn(),
            chip: jest.fn(),
            win: jest.fn(),
            bust: jest.fn(),
        });
    }

    when = {
        created: (): void => {
            render(
                <DealingCard>
                    <Text testID={CHILD_TEST_ID}>{`child`}</Text>
                </DealingCard>,
            );
        },
    };

    assert = {
        childVisible: (): void => {
            expect(screen.getByTestId(CHILD_TEST_ID)).toBeOnTheScreen();
        },
        dealSoundPlayed: (): void => {
            expect(this._mockDeal).toHaveBeenCalled();
        },
    };
}

export const makeDealingCardDriver = (): DealingCardDriver => new DealingCardDriver();

describe('DealingCard driver module', () => {
    it('exports the driver factory', () => {
        expect(makeDealingCardDriver).toBeDefined();
    });
});
