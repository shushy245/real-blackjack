import { MMKV } from 'react-native-mmkv';
import constants, { ExecutionEnvironment } from 'expo-constants';

export type StorageAdapter = {
    getString: (key: string) => string | undefined;
    set: (key: string, value: string) => void;
    delete: (key: string) => void;
};

const makeMemoryStorage = (): StorageAdapter => {
    const store = new Map<string, string>();

    return {
        getString: (key) => store.get(key),
        set: (key, value) => {
            store.set(key, value);
        },
        delete: (key) => {
            store.delete(key);
        },
    };
};

const makeMmkvStorage = (id: string): StorageAdapter => {
    const mmkv = new MMKV({ id });

    return {
        getString: (key) => mmkv.getString(key),
        set: (key, value) => mmkv.set(key, value),
        delete: (key) => mmkv.delete(key),
    };
};

export const makeStorage = (id: string): StorageAdapter =>
    constants.executionEnvironment === ExecutionEnvironment.StoreClient ? makeMemoryStorage() : makeMmkvStorage(id);
