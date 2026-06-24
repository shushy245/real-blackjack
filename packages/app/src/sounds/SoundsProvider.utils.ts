export const DEAL_DEBOUNCE_MS = 200;

export const isWithinDealDebounce = (lastPlayedMs: number): boolean => Date.now() - lastPlayedMs < DEAL_DEBOUNCE_MS;
