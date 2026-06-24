import { makeDealerHandDriver } from './DealerHand.driver';

describe('DealerHand', () => {
    let driver: ReturnType<typeof makeDealerHandDriver>;

    beforeEach(() => {
        jest.useFakeTimers();
        driver = makeDealerHandDriver();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('does not call onAllCardsVisible before stagger timers complete', () => {
        driver.when.created();
        driver.assert.onAllCardsVisibleNotCalled();
    });

    it('calls onAllCardsVisible after all cards become visible', async () => {
        driver.when.created();
        await driver.when.allCardsRevealedWithTime();
        driver.assert.onAllCardsVisibleCalled();
    });
});
