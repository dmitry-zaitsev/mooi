import { TranslatedValueEntry, TranslationStoreFactory, TranslationsStore } from "../../src/store";

export class InMemoryTranslationStore implements TranslationsStore {

    private store = new Map<string, TranslatedValueEntry>();

    public put(key: string, value: string, hash: string): void {
        this.store.set(key, {key, value, hash});
    }

    public get(key: string): TranslatedValueEntry | undefined {
        return this.store.get(key);
    }

    public getByHash(hash: string): TranslatedValueEntry | undefined {
        for (const entry of this.store.values()) {
            if (entry.hash === hash) {
                return entry;
            }
        }

        return undefined;
    }

    public remove(key: string): void {
        this.store.delete(key);
    }

    public clear(): void {
        this.store.clear();
    }

    public contains(key: string): boolean {
        return this.store.has(key);
    }

    public entries(): TranslatedValueEntry[] {
        return Array.from(this.store.values());
    }

}

const stores: Map<string, InMemoryTranslationStore> = new Map();

export const fakeTranslationStoreFactory: TranslationStoreFactory = (lanaugeCode) => {
    return fakeTranslationStore(lanaugeCode);
};

export const fakeTranslationStore = (lanaugeCode: string) => {
    if (!stores.has(lanaugeCode)) {
        stores.set(lanaugeCode, new InMemoryTranslationStore());
    }

    const store = stores.get(lanaugeCode);

    if (!store) {
        throw new Error(`No store for language ${lanaugeCode}`);
    }

    return store;
};

export const storedLanguages = () => Array.from(stores.keys());

export const clearTranslationStores = () => {
    stores.clear();
}
