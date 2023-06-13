import yaml = require('js-yaml');
import fs = require('fs');
import { TranslatedValueEntry } from "./schema";

export type TranslationStoreFactory = (languageCode: string) => TranslationsStore;

export const createDiskTranslationStoreFactory = (directory: string): TranslationStoreFactory => {
    return (languageCode: string) => new DiskTranslationsStore(directory, languageCode);
}

export interface TranslationsStore {

    put(key: string, value: string, hash: string): void;

    get(key: string): TranslatedValueEntry | undefined;

    getByHash(hash: string): TranslatedValueEntry | undefined;

    remove(key: string): void;

    contains(key: string): boolean;

    entries(): TranslatedValueEntry[];

}

export class DiskTranslationsStore implements TranslationsStore {

    private cacheFile: string;
    private cache: Map<string, TranslatedValueEntry>;

    constructor(directory: string, languageCode: string) {
        const targetDirectory = `${directory}/translations`;
        if (!fs.existsSync(targetDirectory)) {
            fs.mkdirSync(targetDirectory);
        }

        this.cacheFile = `${targetDirectory}/translations_${languageCode}.yaml`;
        this.cache = this.loadCache();
    }

    private loadCache(): Map<string, TranslatedValueEntry> {
        if (!fs.existsSync(this.cacheFile)) {
            fs.writeFileSync(this.cacheFile, yaml.dump([]));
        }

        const entries =  yaml.load(fs.readFileSync(this.cacheFile, 'utf8')) as TranslatedValueEntry[];

        const result = new Map<string, TranslatedValueEntry>();

        for (const entry of entries) {
            result.set(entry.key, entry);
        }

        return result;
    }

    public put(key: string, value: string, hash: string): void {
        this.cache.set(key, {
            key,
            value,
            hash,
        });

        this.saveCache();
    }

    public get(key: string): TranslatedValueEntry | undefined {
        return this.cache.get(key);
    }

    public getByHash(hash: string): TranslatedValueEntry | undefined {
        // TODO: optimize to O(1)
        for (const entry of this.cache.values()) {
            if (entry.hash === hash) {
                return entry;
            }
        }

        return undefined;
    }

    public remove(key: string): void {
        this.cache.delete(key);
        this.saveCache();
    }

    public contains(key: string): boolean {
        return this.cache.has(key);
    }

    public entries(): TranslatedValueEntry[] {
        return Array.from(this.cache.values());
    }

    private saveCache(): void {
        fs.writeFileSync(this.cacheFile, yaml.dump(this.entries()));
    }

}
