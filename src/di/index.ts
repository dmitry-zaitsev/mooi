import { HashFunction, sha1HashFunction } from "../crypto";
import { Formatter, YamlBasedFormatter } from "../output";
import { TranslationStoreFactory, createDiskTranslationStoreFactory } from "../store";
import { Translator } from "../translate";
import { TranlsatorEngine } from "../translate/engine";
import { OpenaiTranslatorEngine } from "../translate/engine/openai";
import { ConsolePrinter, Printer } from "../util/printer";

export let overrides: Partial<AppModule> = {};

export type AppModule = {
    translatorEngine: TranlsatorEngine;
    outputFormatter: Formatter;
    translationStoreFactory: TranslationStoreFactory;
    hashFunction: HashFunction;
    inputDirectory: string;
}

/**
 * Params that are configurable by user.
 */
export type DiParams = {
    openAiApiKey: string;
    inputDirectory: string;
}

export class App {

    public static translator: Translator;
    public static printer: Printer;
    public static inputDirectory: string;

    public static initialize(module: AppModule): void {
        this.printer = new ConsolePrinter();
        this.inputDirectory = module.inputDirectory;

        App.translator = new Translator(
            module.translatorEngine,
            module.outputFormatter,
            module.translationStoreFactory,
            module.hashFunction,
        );
    }

}

export const inittializeDependencies = (params: DiParams) => {
    App.initialize({
        translatorEngine: new OpenaiTranslatorEngine(params.openAiApiKey),
        hashFunction: sha1HashFunction,
        translationStoreFactory: createDiskTranslationStoreFactory(params.inputDirectory),
        outputFormatter: new YamlBasedFormatter(),
        inputDirectory: params.inputDirectory,
        ...overrides,
    });
}

export const initializeForTests = (input: Partial<AppModule>) => {
    overrides = input;
}
