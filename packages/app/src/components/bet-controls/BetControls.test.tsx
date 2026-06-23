import { makeBetControlsDriver } from './BetControls.driver';

describe('BetControls', () => {
    let driver: ReturnType<typeof makeBetControlsDriver>;

    beforeEach(() => {
        driver = makeBetControlsDriver();
    });

    describe('bet counter', () => {
        it('starts at $0', () => {
            driver.when.created();
            driver.assert.betCounter('$0');
        });

        it('adds chip value when a chip is tapped', () => {
            driver.given.balance(500);
            driver.when.created();
            driver.click.chip(25);
            driver.assert.betCounter('$25');
        });

        it('accumulates multiple chips', () => {
            driver.given.balance(500);
            driver.when.created();
            driver.click.chip(25);
            driver.click.chip(50);
            driver.assert.betCounter('$75');
        });

        it('resets to $0 when clear is tapped', () => {
            driver.given.balance(500);
            driver.when.created();
            driver.click.chip(25);
            driver.click.clear();
            driver.assert.betCounter('$0');
        });

        it('sets pending bet to lastBet when repeat is tapped', () => {
            driver.given.balance(500);
            driver.given.lastBet(100);
            driver.given.minBet(10);
            driver.when.created();
            driver.click.repeat();
            driver.assert.betCounter('$100');
        });
    });

    describe('deal button', () => {
        it('is disabled when pendingBet is below minBet', () => {
            driver.given.minBet(10);
            driver.when.created();
            driver.assert.dealDisabled();
        });

        it('is enabled when pendingBet meets minBet', () => {
            driver.given.balance(500);
            driver.given.minBet(10);
            driver.when.created();
            driver.click.chip(10);
            driver.assert.dealEnabled();
        });

        it('calls onPlaceBet with the pending amount', () => {
            const onPlaceBet = jest.fn();
            driver.given.balance(500);
            driver.given.minBet(10);
            driver.given.onPlaceBet(onPlaceBet);
            driver.when.created();
            driver.click.chip(25);
            driver.click.deal();
            driver.assert.onPlaceCalledWith(25);
        });

        it('resets counter to $0 after dealing', () => {
            driver.given.balance(500);
            driver.given.minBet(10);
            driver.when.created();
            driver.click.chip(25);
            driver.click.deal();
            driver.assert.betCounter('$0');
        });

        it('does not call onPlaceBet when pendingBet is below minBet', () => {
            const onPlaceBet = jest.fn();
            driver.given.minBet(25);
            driver.given.onPlaceBet(onPlaceBet);
            driver.when.created();
            driver.click.chip(10);
            driver.click.deal();
            driver.assert.onPlaceNotCalled();
        });
    });

    describe('repeat button', () => {
        it('is disabled when lastBet is 0', () => {
            driver.given.lastBet(0);
            driver.given.minBet(10);
            driver.when.created();
            driver.assert.repeatDisabled();
        });

        it('is disabled when lastBet is below minBet', () => {
            driver.given.lastBet(5);
            driver.given.minBet(10);
            driver.when.created();
            driver.assert.repeatDisabled();
        });

        it('is disabled when lastBet exceeds balance', () => {
            driver.given.lastBet(100);
            driver.given.minBet(10);
            driver.given.balance(50);
            driver.when.created();
            driver.assert.repeatDisabled();
        });

        it('is enabled when lastBet is valid and within balance', () => {
            driver.given.lastBet(50);
            driver.given.minBet(10);
            driver.given.balance(500);
            driver.when.created();
            driver.assert.repeatEnabled();
        });
    });

    describe('chip tray', () => {
        it('disables a chip when adding it would exceed the balance', () => {
            driver.given.balance(30);
            driver.when.created();
            driver.assert.chipDisabled(50);
        });

        it('enables a chip when it fits within remaining balance', () => {
            driver.given.balance(500);
            driver.when.created();
            driver.assert.chipEnabled(50);
        });

        it('disables a chip after pending bet leaves insufficient balance', () => {
            driver.given.balance(60);
            driver.when.created();
            driver.click.chip(50);
            driver.assert.chipDisabled(25);
        });
    });
});
