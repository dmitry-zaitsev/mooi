import { HashFunction } from "../crypto";
import { ProductCopy } from "../input";
import { Formatter, FormatterContext, Translation } from "../output";
import { TranslationStoreFactory } from "../store/translations";
import { TranlsatorEngine } from "./engine";

export type TranslatorContext = {} & FormatterContext;

export class Translator {

    private engine: TranlsatorEngine;
    private formatter: Formatter;
    private storeFactory: TranslationStoreFactory;
    private hashFunction: HashFunction;

    constructor(
        engine: TranlsatorEngine,
        formatter: Formatter,
        storeFactory: TranslationStoreFactory,
        hashFunction: HashFunction,
    ) {
        this.engine = engine;
        this.formatter = formatter;
        this.storeFactory = storeFactory;
        this.hashFunction = hashFunction;
    }

    public async translate(
        context: TranslatorContext,
        languages: string[],
        entries: ProductCopy[]
    ): Promise<void> {
        for (const language of languages) {
            await this.translateLanguage(language, entries);
            await this.applyFormat(context, language);
        }

        await this.passThroughOriginalLanguage(context, entries);
    }

    private async passThroughOriginalLanguage(
        context: TranslatorContext,
        entries: ProductCopy[]
    ): Promise<void> {
        const languageCode = 'en'; // TODO make configurable
        const store = this.storeFactory(languageCode);
        store.clear();

        entries.forEach(entry => {
            store.put(entry.key, entry.value, this.hashFunction([entry.value, entry.description || null]));
        });

        await this.applyFormat(context, languageCode);
    }

    private async translateLanguage(
        language: string,
        entries: ProductCopy[]
    ): Promise<void> {
        const store = this.storeFactory(language);
        const batchSize = this.engine.maxBatchSize();

        const presentKeys = new Set(entries.map(entry => entry.key));
        const keyToHash: {[key: string]: string} = {}
        const hashToValue: {[hash: string]: string} = {}
        for (const entry of entries) {
            const hash = this.hashFunction([entry.value, entry.description || null]);

            keyToHash[entry.key] = hash;

            const existingValue = store.getByHash(hash)?.value;
            if (existingValue) {
                hashToValue[hash] = existingValue;
            }
        }

        const entriesWithExistingTranslation = entries
            .filter(entry => {
                const hash = keyToHash[entry.key];

                const existingValue = hashToValue[hash];
                if (!existingValue) {
                    // Was not translated yet
                    return false;
                }

                return true;
            });

        entriesWithExistingTranslation.forEach(entry => {
            const hash = keyToHash[entry.key];
            const existingValue = hashToValue[hash];
            store.put(entry.key, existingValue, hash);
        });
        const keysWithExistingTranslation = new Set(entriesWithExistingTranslation.map(entry => entry.key));

        const entriesForTranslation = entries
            .filter(entry => {
                if (keysWithExistingTranslation.has(entry.key)) {
                    return false;
                }

                const existingTranslation = store.get(entry.key);
                if (!existingTranslation) {
                    // Was not translated yet
                    return true;
                }

                const hash = keyToHash[entry.key];

                if (existingTranslation.hash !== hash) {
                    // Was translated but the source changed
                    return true;
                }

                return false;
            });

        for (let i = 0; i < entriesForTranslation.length; i += batchSize) {
            const batch = entriesForTranslation.slice(i, i + batchSize);
            const translations = await this.engine.translate(batch, language);

            for (let j = 0; j < batch.length; j++) {
                const entry = batch[j];
                const translation = translations[j];

                const hash = keyToHash[entry.key];
                store.put(entry.key, translation, hash);
            }
        }

        for (const entry of store.entries()) {
            if (!presentKeys.has(entry.key)) {
                store.remove(entry.key);
            }
        }
    }

    private async applyFormat(context: TranslatorContext, language: string): Promise<void> {
        const store = this.storeFactory(language);
        const entries = store.entries();

        const translations: Translation[] = entries.map(entry => {
            return {
                key: entry.key,
                value: entry.value,
                languageCode: language,
            };
        });

        await this.formatter.write(context, translations);
    }

}
