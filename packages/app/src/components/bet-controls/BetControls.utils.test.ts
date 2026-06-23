import { clampBet, formatAmount } from './BetControls.utils';

describe('clampBet', () => {
    it('adds the chip denomination to the current bet', () => {
        expect(clampBet(0, 25, 1000)).toBe(25);
    });

    it('accumulates correctly', () => {
        expect(clampBet(50, 25, 1000)).toBe(75);
    });

    it('clamps the result to balance', () => {
        expect(clampBet(20, 25, 30)).toBe(30);
    });

    it('returns balance exactly when current + added equals balance', () => {
        expect(clampBet(25, 25, 50)).toBe(50);
    });
});

describe('formatAmount', () => {
    it('formats zero as $0', () => {
        expect(formatAmount(0)).toBe('$0');
    });

    it('prepends a dollar sign', () => {
        expect(formatAmount(100)).toBe('$100');
    });
});
