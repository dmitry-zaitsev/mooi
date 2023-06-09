import { HashFunction, sha1HashFunction } from "../crypto";
import { Formatter, YamlBasedFormatter } from "../output";
import { TranslationStoreFactory, createDiskTranslationStoreFactory } from "../store";
import { Translator } from "../translate";
import { TranlsatorEngine } from "../translate/engine";
import { OpenaiTranslatorEngine } from "../translate/engine/openai";

export let underTest: boolean = false;

export function setUnderTest(): void {
    underTest = true;
}

export type AppModule = {
    translatorEngine: TranlsatorEngine;
    outputFormatter: Formatter;
    translationStoreFactory: TranslationStoreFactory;
    hashFunction: HashFunction;
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

    public static initialize(module: AppModule): void {
        App.translator = new Translator(
            module.translatorEngine,
            module.outputFormatter,
            module.translationStoreFactory,
            module.hashFunction,
        );
    }

}

export const inittializeDependencies = (params: DiParams) => {
    if (underTest) {
        return;
    }

    App.initialize({
        translatorEngine: new OpenaiTranslatorEngine(params.openAiApiKey),
        hashFunction: sha1HashFunction,
        translationStoreFactory: createDiskTranslationStoreFactory(params.inputDirectory),
        outputFormatter: new YamlBasedFormatter(),
    });
}
