import { ProductCopy } from "../../input";

export interface TranlsatorEngine {

    translate: (
        input: ProductCopy[],
        languageCode: string,
    ) => Promise<string[]>;

    maxBatchSize(): number;

}
