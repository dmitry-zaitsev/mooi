import { ProductCopy } from "../../src/input";
import { TranlsatorEngine } from "../../src/translate/engine/engine";

export class FakeTranslatorEngine implements TranlsatorEngine {

    private _invocationCount: number = 0;

    public async translate(input: ProductCopy[], languageCode: string): Promise<string[]> {
        this._invocationCount++;
        return input.map(entry => `${languageCode}(${entry.value})`);
    }

    public maxBatchSize(): number {
        return 1;
    }

    public invocationCount(): number {
        return this._invocationCount;
    }

}