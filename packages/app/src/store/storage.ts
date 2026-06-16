import { MMKV } from 'react-native-mmkv';

export type StorageAdapter = {
    getString: (key: string) => string | undefined;
    set: (key: string, value: string) => void;
    delete: (key: string) => void;
};

export const makeStorage = (id: string): StorageAdapter => {
    const mmkv = new MMKV({ id });

    return {
        getString: (key) => mmkv.getString(key),
        set: (key, value) => mmkv.set(key, value),
        delete: (key) => mmkv.delete(key),
    };
};
