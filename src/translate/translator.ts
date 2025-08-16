import { HashFunction } from "../crypto";
import { App } from "../di";
import { ProductCopy, FileCopy } from "../input";
import { Formatter, FormatterContext, Translation } from "../output";
import { TranslationStoreFactory, TranslationsStore } from "../store/translations";
import { TranlsatorEngine } from "./engine";
import { FileTranslator } from "./fileTranslator";

export type TranslatorContext = {} & FormatterContext;

export class Translator {

    private engine: TranlsatorEngine;
    private formatter: Formatter;
    private storeFactory: TranslationStoreFactory;
    private hashFunction: HashFunction;
    private context?: string;
    private useContextForChecksum: boolean;
    private fileTranslator: FileTranslator;

    constructor(
        engine: TranlsatorEngine,
        formatter: Formatter,
        storeFactory: TranslationStoreFactory,
        hashFunction: HashFunction,
        context?: string,
        useContextForChecksum?: boolean,
    ) {
        this.engine = engine;
        this.formatter = formatter;
        this.storeFactory = storeFactory;
        this.hashFunction = hashFunction;
        this.context = context;
        this.useContextForChecksum = useContextForChecksum || false;
        this.fileTranslator = new FileTranslator(
            engine,
            storeFactory,
            hashFunction,
            context
        );
    }

    public async translate(
        context: TranslatorContext,
        languages: string[],
        entries: (ProductCopy | FileCopy)[]
    ): Promise<void> {
        // Separate file entries from product copy entries
        const productEntries = entries.filter(e => 'key' in e) as ProductCopy[];
        const fileEntries = entries.filter(e => 'filePath' in e) as FileCopy[];

        // Translate product copies
        if (productEntries.length > 0) {
            for (const language of languages) {
                App.printer.info(`Translating to ${language}:`);
                await this.translateLanguage(context, language, productEntries);
                await this.applyFormat(context, productEntries, language);
            }
            await this.passThroughOriginalLanguage(context, productEntries);
        }

        // Translate files
        if (fileEntries.length > 0) {
            await this.fileTranslator.translateFiles(fileEntries, languages);
        }
    }

    private async passThroughOriginalLanguage(
        context: TranslatorContext,
        entries: ProductCopy[]
    ): Promise<void> {
        const languageCode = 'en'; // TODO make configurable
        const store = this.storeFactory(languageCode);
        store.clear();

        entries.forEach(entry => {
            store.put(entry.key, entry.value, this.computeHash(entry));
        });

        await this.applyFormat(context, entries, languageCode);
    }

    private async translateLanguage(
        context: TranslatorContext,
        language: string,
        entries: ProductCopy[]
    ): Promise<void> {
        const store = this.storeFactory(language);
        const batchSize = this.engine.maxBatchSize();
        const presentKeys = new Set(entries.map(entry => entry.key));

        const filteredEntries = entries
            .filter(entry => !context.includedTags || entry.tags?.some(tag => context.includedTags?.includes(tag)));

        const { keyToHash, hashToValue } = this.aggregateEntries(filteredEntries, store);

        const entriesWithExistingTranslation = filteredEntries
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

        const entriesForTranslation = filteredEntries
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

        if (entriesForTranslation.length === 0) {
            App.printer.info(`    Nothing new to translate`);
        }

        for (let i = 0; i < entriesForTranslation.length; i += batchSize) {
            const batch = entriesForTranslation.slice(i, i + batchSize);
            
            App.printer.info(`  Translating batch of ${batch.length}`);
            for (const entry of batch) {
                App.printer.info(`    ${entry.key}`);
            }

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

    private aggregateEntries(entries: ProductCopy[], store: TranslationsStore): {
        keyToHash: {[key: string]: string},
        hashToValue: {[hash: string]: string},
    } {
        const keyToHash: {[key: string]: string} = {}
        const hashToValue: {[hash: string]: string} = {}
        for (const entry of entries) {
            const hash = this.computeHash(entry);

            keyToHash[entry.key] = hash;

            const existingValue = store.getByHash(hash)?.value;
            if (existingValue) {
                hashToValue[hash] = existingValue;
            }
        }

        return {
            keyToHash,
            hashToValue,
        };
    }

    private computeHash(entry: ProductCopy): string {
        const hashInputs: any[] = [entry.value, entry.description || null];
        if (this.useContextForChecksum && this.context) {
            hashInputs.push(this.context);
        }
        return this.hashFunction(hashInputs);
    }

    private async applyFormat(
        context: TranslatorContext, 
        allEntries: ProductCopy[], 
        language: string
    ): Promise<void> {
        const store = this.storeFactory(language);
        const entries = store.entries();

        const entriesByKeys: {[key: string]: ProductCopy} = {};
        for (const entry of allEntries) {
            entriesByKeys[entry.key] = entry;
        }

        const translations: Translation[] = entries
            .filter(entry => {
                const originalDefinition = entriesByKeys[entry.key];
                
                if (!originalDefinition) {
                    return false;
                }

                if (!context.includedTags) {
                    return true;
                }

                if (originalDefinition.tags?.some(tag => context.includedTags?.includes(tag))) {
                    return true;
                }

                return false;
            })
            .map(entry => {
                return {
                    key: entry.key,
                    value: entry.value,
                    languageCode: language,
                };
            });

        await this.formatter.write(context, translations);
    }

}
