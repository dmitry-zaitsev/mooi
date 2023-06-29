import { Translation } from "./schema";

export type FormatterContext = {
    rootDir: string;
    inputDir: string;
    includedTags?: string[];
}

export interface Formatter {

    write: (context: FormatterContext, translations: Translation[]) => Promise<void>;

}

export class NoopFormatter implements Formatter {

    public async write(context: FormatterContext, translations: Translation[]): Promise<void> {
        // noop
    }

}
