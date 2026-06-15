export type Rng = () => number;

export const createRng = (seed?: number): Rng => {
    let state = (seed ?? Date.now()) >>> 0;

    return () => {
        state |= 0;
        state = (state + 0x6d2b79f5) | 0;
        let z = Math.imul(state ^ (state >>> 15), 1 | state);
        z = (z ^ (z + Math.imul(z ^ (z >>> 7), 61 | z))) >>> 0;

        return ((z ^ (z >>> 14)) >>> 0) / 0x100000000;
    };
};

export const shuffle = <T>(arr: readonly T[], rng: Rng): T[] => {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const a = result[i];
        const b = result[j];
        if (a === undefined || b === undefined)
            throw new Error(`shuffle: index out of bounds (i=${i}, j=${j}, len=${result.length})`);
        result[i] = b;
        result[j] = a;
    }

    return result;
};
