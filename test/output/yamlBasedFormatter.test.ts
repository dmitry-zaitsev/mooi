import { cleanUpTestFiles } from "../util/files";
import { YamlBasedFormatter } from "../../src/output/yamlBasedFormatter";
import { Translation } from "../../src/output/schema";
import { expect } from "chai";
import * as fs from 'fs';

const translations: Translation[] = [
    {
        key: 'A',
        value: 'nl(Value A)',
        languageCode: 'nl',
    },
    {
        key: 'A',
        value: 'de(Value A)',
        languageCode: 'de',
    },
];

describe('yamlBasedFormatter', () => {
    afterEach(() => {
        cleanUpTestFiles();
    });

    it('should apply default config unless specified otherwise', async () => {
        // Given
        const testee = new YamlBasedFormatter();

        // When
        await testee.write(
            {
                rootDir: 'test',
                inputDir: 'test/assets/yamlBasedFormatter/defaultConfig',
            },
            translations,
        );

        // Then
        expect(fs.existsSync('tmp/translations_nl/translations.json')).to.be.true;
        expect(fs.existsSync('tmp/translations_de/translations.json')).to.be.true;

        const translationsNl = JSON.parse(fs.readFileSync('tmp/translations_nl/translations.json', 'utf8'));
        expect(translationsNl).to.deep.eq({
            A: 'nl(Value A)',
        });

        const translationsDe = JSON.parse(fs.readFileSync('tmp/translations_de/translations.json', 'utf8'));
        expect(translationsDe).to.deep.eq({
            A: 'de(Value A)',
        });
    });

    it('should do nothing if config does not contain formats', async () => {
        // Given
        const testee = new YamlBasedFormatter();

        // When
        await testee.write(
            {
                rootDir: 'test',
                inputDir: 'test/assets/yamlBasedFormatter/emptyConfig',
            },
            translations,
        );

        // Then
        // Nothing happens
    });

    it('should do nothing if config file does not exist', async () => {
        // Given
        const testee = new YamlBasedFormatter();

        // When
        await testee.write(
            {
                rootDir: 'test',
                inputDir: 'test/assets/yamlBasedFormatter/noConfig',
            },
            translations,
        );

        // Then
        // Nothing happens
    });
});