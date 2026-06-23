import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { FlippableCard } from './FlippableCard';

const FRONT_ID = 'flip-front';
const BACK_ID = 'flip-back';

class FlippableCardDriver {
    private _flipped = false;

    given = {
        flipped: (v: boolean): void => {
            this._flipped = v;
        },
    };

    when = {
        created: (): void => {
            render(
                <FlippableCard
                    front={<Text testID={FRONT_ID}>{`FRONT`}</Text>}
                    back={<Text testID={BACK_ID}>{`BACK`}</Text>}
                    flipped={this._flipped}
                />,
            );
        },
    };

    assert = {
        frontRendered: (): void => {
            expect(screen.getByTestId(FRONT_ID)).toBeOnTheScreen();
        },
        backRendered: (): void => {
            expect(screen.getByTestId(BACK_ID)).toBeOnTheScreen();
        },
    };
}

export const makeFlippableCardDriver = (): FlippableCardDriver => new FlippableCardDriver();

describe('FlippableCard', () => {
    let driver: ReturnType<typeof makeFlippableCardDriver>;

    beforeEach(() => {
        driver = makeFlippableCardDriver();
    });

    it('renders both faces in the DOM', () => {
        driver.when.created();
        driver.assert.frontRendered();
        driver.assert.backRendered();
    });
});
