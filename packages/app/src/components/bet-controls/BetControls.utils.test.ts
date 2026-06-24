import { makeBetControlsUtilsDriver } from './BetControls.utils.driver';

let driver: ReturnType<typeof makeBetControlsUtilsDriver>;

beforeEach(() => {
    driver = makeBetControlsUtilsDriver();
});

describe('clampBet', () => {
    it('adds the chip denomination to the current bet', () => {
        driver.assert.clampBet(0, 25, 1000, 25);
    });

    it('accumulates correctly', () => {
        driver.assert.clampBet(50, 25, 1000, 75);
    });

    it('clamps the result to balance', () => {
        driver.assert.clampBet(20, 25, 30, 30);
    });

    it('returns balance exactly when current + added equals balance', () => {
        driver.assert.clampBet(25, 25, 50, 50);
    });
});

describe('defaultPendingBet', () => {
    it('returns 0 when lastBet is 0', () => {
        driver.assert.defaultPendingBet(0, 1000, 0);
    });

    it('returns lastBet when it fits within balance', () => {
        driver.assert.defaultPendingBet(100, 1000, 100);
    });

    it('clamps to balance when lastBet exceeds balance', () => {
        driver.assert.defaultPendingBet(200, 50, 50);
    });
});

describe('formatAmount', () => {
    it('formats zero as $0', () => {
        driver.assert.formatAmount(0, '$0');
    });

    it('prepends a dollar sign', () => {
        driver.assert.formatAmount(100, '$100');
    });
});
