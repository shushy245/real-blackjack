export type StorageAdapter = {
    getString: (key: string) => string | undefined;
    set: (key: string, value: string) => void;
    delete: (key: string) => void;
};

export const makeStorage = (_id: string): StorageAdapter => ({
    getString: (key) => localStorage.getItem(key) ?? undefined,
    set: (key, value) => localStorage.setItem(key, value),
    delete: (key) => localStorage.removeItem(key),
});
