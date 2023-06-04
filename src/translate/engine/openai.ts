import { ProductCopy } from "../../input";
import { TranlsatorEngine } from "./engine";

export class OpenaiTranslatorEngine implements TranlsatorEngine {
    
    public async translate(input: ProductCopy[], languageCode: string): Promise<string[]> {
        return input.map(entry => `${languageCode}(${entry.value})`);   // TODO implement
    }

    public maxBatchSize(): number {
        return 1;   // TODO implement
    }
        
}