import type { StoragePort } from './storage.port';

export class MemoryStorageAdapter implements StoragePort {
    private readonly store = new Map<string, string>();

    async getItem(key: string): Promise<string | undefined> {
        return this.store.get(key);
    }

    async setItem(key: string, value: string): Promise<void> {
        this.store.set(key, value);
    }

    async removeItem(key: string): Promise<void> {
        this.store.delete(key);
    }
}
