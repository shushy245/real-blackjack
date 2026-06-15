import { type HandValue } from './hand';

export const shouldDealerHit = (hand: HandValue): boolean => hand.value < 17 || (hand.isSoft && hand.value === 17);
