import { aRoundState } from '~/testkit/builders';

import { makeUseAutoCollectDriver } from './useAutoCollect.driver';

describe('useAutoCollect', () => {
    let driver: ReturnType<typeof makeUseAutoCollectDriver>;

    beforeEach(() => {
        jest.useFakeTimers();
        driver = makeUseAutoCollectDriver();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('calls onCollect after delay when cards become visible during settling phase', async () => {
        driver.given.round(aRoundState().withPhase('settling').build());
        driver.when.rendered();
        driver.when.onAllCardsVisibleFired();
        await driver.when.collectDelayElapsed();
        driver.assert.onCollectCalled();
    });

    it('calls onCollect when settling begins after cards are already visible', async () => {
        driver.given.round(aRoundState().withPhase('dealer-turn').build());
        driver.when.rendered();
        driver.when.onAllCardsVisibleFired();
        driver.when.roundUpdated(aRoundState().withPhase('settling').build());
        await driver.when.collectDelayElapsed();
        driver.assert.onCollectCalled();
    });

    it('does not call onCollect before delay elapses', () => {
        driver.given.round(aRoundState().withPhase('settling').build());
        driver.when.rendered();
        driver.when.onAllCardsVisibleFired();
        driver.assert.onCollectNotCalled();
    });

    it('does not call onCollect when settling begins but cards are not yet visible', async () => {
        driver.given.round(aRoundState().withPhase('settling').build());
        driver.when.rendered();
        await driver.when.collectDelayElapsed();
        driver.assert.onCollectNotCalled();
    });

    it('cancels the timer when round ends before delay elapses', async () => {
        driver.given.round(aRoundState().withPhase('settling').build());
        driver.when.rendered();
        driver.when.onAllCardsVisibleFired();
        driver.when.roundUpdated(undefined);
        await driver.when.collectDelayElapsed();
        driver.assert.onCollectNotCalled();
    });
});
