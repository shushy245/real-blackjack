import { makeDealingCardDriver } from './DealingCard.driver';

describe('DealingCard', () => {
    let driver: ReturnType<typeof makeDealingCardDriver>;

    beforeEach(() => {
        driver = makeDealingCardDriver();
    });

    it('renders its children', () => {
        driver.when.created();
        driver.assert.childVisible();
    });

    it('plays the deal sound on mount', () => {
        driver.when.created();
        driver.assert.dealSoundPlayed();
    });
});
