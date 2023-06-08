import { Formatter, FormatterContext, Translation } from '../../src/output';

export class FakeFormatter implements Formatter {

    private _writtenTranslations: Translation[] = [];

    public async write(context: FormatterContext, translations: Translation[]): Promise<void> {
        this._writtenTranslations.push(...translations);
    }

    public writtenTranslations(): Translation[] {
        return this._writtenTranslations;
    }

}
