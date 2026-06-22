import { getRandomBytes } from './get-random-bytes';

// charset is sorted lexicographically — load-bearing for sortability; do not reorder
const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export const generateUniqueId = (prefix: string): string => `${prefix}-z${encodeTime(Date.now())}-${randomPart()}`;

const charAt = (index: number): string => charset[index % charset.length] ?? '0';

const randomPart = (): string =>
    Array.from(getRandomBytes(16))
        .map((n) => charAt(n))
        .join('');

const encodeTime = (timestamp: number, acc = ''): string =>
    timestamp === 0
        ? acc
        : encodeTime(Math.floor(timestamp / charset.length), charAt(timestamp % charset.length) + acc);
