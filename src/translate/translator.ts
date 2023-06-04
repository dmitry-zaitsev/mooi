import { HashFunction } from "../crypto";
import { ProductCopy } from "../input";
import { Formatter, Translation } from "../output";
import { TranslationStoreFactory } from "../store/translations";
import { TranlsatorEngine } from "./engine";

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
        languages: string[],
        entries: ProductCopy[]
    ): Promise<void> {
        for (const language of languages) {
            await this.translateLanguage(language, entries);
            await this.applyFormat(language);
        }
    }

    private async translateLanguage(
        language: string,
        entries: ProductCopy[]
    ): Promise<void> {
        const store = this.storeFactory(language);
        const batchSize = this.engine.maxBatchSize();

        for (let i = 0; i < entries.length; i += batchSize) {
            const batch = entries.slice(i, i + batchSize);
            const translations = await this.engine.translate(batch, language);

            for (let j = 0; j < batch.length; j++) {
                const entry = batch[j];
                const translation = translations[j];

                const hash = this.hashFunction([entry.key, entry.value, entry.description || null]);
                store.put(entry.key, translation, hash);
            }
        }
    }

    private async applyFormat(language: string): Promise<void> {
        const store = this.storeFactory(language);
        const entries = store.entries();

        const translations: Translation[] = entries.map(entry => {
            return {
                key: entry.key,
                value: entry.value,
                languageCode: language,
            };
        });

        await this.formatter.write(translations);
    }

}
