const stores = new Map<string, Map<string, string>>();

export class MMKV {
    private readonly store: Map<string, string>;

    constructor(config?: { id?: string }) {
        const id = config?.id ?? 'default';
        let store = stores.get(id);
        if (store === undefined) {
            store = new Map();
            stores.set(id, store);
        }
        this.store = store;
    }

    getString(key: string): string | undefined {
        return this.store.get(key);
    }

    set(key: string, value: string): void {
        this.store.set(key, value);
    }

    delete(key: string): void {
        this.store.delete(key);
    }
}

export const clearAllMMKVStores = (): void => {
    for (const store of stores.values()) {
        store.clear();
    }
};
