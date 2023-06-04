import { Translation } from "./schema";

export interface Formatter {

    write: (translations: Translation[]) => Promise<void>;

}

export class NoopFormatter implements Formatter {

    public async write(translations: Translation[]): Promise<void> {
        // noop
    }

}
