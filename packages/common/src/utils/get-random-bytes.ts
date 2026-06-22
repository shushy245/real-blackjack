export const getRandomBytes = (length: number): Uint8Array => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- globalThis.crypto is typed as always present but absent in Expo Go's Hermes runtime
    if (globalThis.crypto === undefined || globalThis.crypto.getRandomValues === undefined) {
        return Uint8Array.from({ length }, () => Math.floor(Math.random() * 256));
    }
    const bytes = new Uint8Array(length);
    globalThis.crypto.getRandomValues(bytes);

    return bytes;
};
