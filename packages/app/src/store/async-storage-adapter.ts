import AsyncStorage from '@react-native-async-storage/async-storage';

import type { StoragePort } from './storage.port';

export class AsyncStorageAdapter implements StoragePort {
    async getItem(key: string): Promise<string | undefined> {
        return (await AsyncStorage.getItem(key)) ?? undefined;
    }

    async setItem(key: string, value: string): Promise<void> {
        await AsyncStorage.setItem(key, value);
    }

    async removeItem(key: string): Promise<void> {
        await AsyncStorage.removeItem(key);
    }
}
