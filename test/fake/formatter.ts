import { Formatter, Translation } from '../../src/output';

export class FakeFormatter implements Formatter {

    private _writtenTranslations: Translation[] = [];

    public async write(translations: Translation[]): Promise<void> {
        this._writtenTranslations.push(...translations);
    }

    public writtenTranslations(): Translation[] {
        return this._writtenTranslations;
    }

}
