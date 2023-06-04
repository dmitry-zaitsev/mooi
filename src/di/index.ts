import { HashFunction } from "../crypto";
import { Formatter } from "../output";
import { TranslationStoreFactory } from "../store";
import { Translator } from "../translate";
import { TranlsatorEngine } from "../translate/engine";

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