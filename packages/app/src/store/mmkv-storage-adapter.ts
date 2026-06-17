import { MMKV } from 'react-native-mmkv';

import type { StoragePort } from './storage.port';

export class MmkvStorageAdapter implements StoragePort {
    constructor(private readonly mmkv: MMKV) {}

    async getItem(key: string): Promise<string | undefined> {
        return this.mmkv.getString(key);
    }

    async setItem(key: string, value: string): Promise<void> {
        this.mmkv.set(key, value);
    }

    async removeItem(key: string): Promise<void> {
        this.mmkv.delete(key);
    }
}
