import { TranslatedValueEntry, TranslationStoreFactory, TranslationsStore } from "../../src/store";

export class InMemoryTranslationStore implements TranslationsStore {

    private store = new Map<string, TranslatedValueEntry>();

    public put(key: string, value: string, hash: string): void {
        this.store.set(key, {key, value, hash});
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
    if (!stores.has(lanaugeCode)) {
        stores.set(lanaugeCode, new InMemoryTranslationStore());
    }

    return stores.get(lanaugeCode) as InMemoryTranslationStore;
};

export const fakeTranslationStore = (lanaugeCode: string) => {
    const store = stores.get(lanaugeCode);

    if (!store) {
        throw new Error(`No store for language ${lanaugeCode}`);
    }

    return store;
};

export const storedLanguages = () => Array.from(stores.keys());
