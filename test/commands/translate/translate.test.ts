import {expect, test} from '@oclif/test'
import {initializeForTests} from '../../../src/di';
import { FakeTranslatorEngine } from '../../fake/engine';
import { clearTranslationStores, fakeTranslationStore, fakeTranslationStoreFactory, storedLanguages } from '../../fake/translations';
import { FakeFormatter } from '../../fake/formatter';
import { fakeHashFunction } from '../../fake/hash';
import * as fs from 'fs';
import * as glob from 'glob';


let fakeTranslatorEngine: FakeTranslatorEngine;
let fakeFormatter: FakeFormatter;

function initializeDependencies(): void {
    fakeTranslatorEngine = new FakeTranslatorEngine();
    fakeFormatter = new FakeFormatter();

    initializeForTests({
        translatorEngine: fakeTranslatorEngine,
        translationStoreFactory: fakeTranslationStoreFactory,
        outputFormatter: fakeFormatter,
        hashFunction: fakeHashFunction,
    });
}

function cleanupGeneratedFiles(): void {
    // Clean up files generated during file translation tests
    const patterns = [
        'test/assets/cases/withFiles/mooi/test_*.md',
        'test/assets/cases/withGlobPattern/mooi/docs/*_*.txt'
    ];
    
    patterns.forEach(pattern => {
        const files = glob.sync(pattern);
        files.forEach(file => {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
        });
    });
}

describe('mooi translate', () => {
    beforeEach(() => {
        clearTranslationStores();
    });

    afterEach(() => {
        cleanupGeneratedFiles();
    });

    test
        .do(() => initializeDependencies())
        .command(['translate', 'test/assets/cases/defaultOutput/mooi', '--openAiKey', 'fakeOpenAiKey'])
        .it('translate file in a project of unknown format', ctx => {
            expect(storedLanguages()).to.have.members(['en', 'de', 'nl']);

            const enEntries = fakeTranslationStore('en').entries();
            expect(enEntries).deep.eq(
                [
                    {
                        key: 'my_string',
                        value: 'My string',
                        hash: 'hash(My string,A test string)',
                    },
                    {
                        key: 'my_string_without_description',
                        value: 'My string without description',
                        hash: 'hash(My string without description)',
                    }
                ]
            )

            const deEntries = fakeTranslationStore('de').entries();
            expect(deEntries).deep.eq(
                [
                    {
                        key: 'my_string',
                        value: 'de(My string)',
                        hash: 'hash(My string,A test string)',
                    },
                    {
                        key: 'my_string_without_description',
                        value: 'de(My string without description)',
                        hash: 'hash(My string without description)',
                    }
                ]
            )

            const nlEntries = fakeTranslationStore('nl').entries();
            expect(nlEntries).deep.eq(
                [
                    {
                        key: 'my_string',
                        value: 'nl(My string)',
                        hash: 'hash(My string,A test string)',
                    },
                    {
                        key: 'my_string_without_description',
                        value: 'nl(My string without description)',
                        hash: 'hash(My string without description)',
                    }
                ]
            )

            // 2 languages * 2 entries
            expect(fakeTranslatorEngine.invocationCount()).eq(4);

            // 2 DE + 2 NL + 2 EN
            expect(fakeFormatter.writtenTranslations().length).eq(6);
        })

    test
        .do(() => initializeDependencies())
        .do(() => {
            // Assuming those strings were already translated and the hash matches
            fakeTranslationStore('de')
                .put('my_string', 'Existing translation', 'hash(My string,A test string)');
            fakeTranslationStore('de')
                .put('my_string_without_description', 'Existing translation', 'Hash that does not match');

            fakeTranslationStore('nl')
                .put('my_string', 'Existing translation', 'hash(My string,A test string)');
        })
        .command(['translate', 'test/assets/cases/defaultOutput/mooi', '--openAiKey', 'fakeOpenAiKey'])
        .it('only translate entries that were not translated already', ctx => {
            expect(storedLanguages()).to.have.members(['en', 'de', 'nl']);

            const deEntries = fakeTranslationStore('de').entries();
            expect(deEntries).deep.eq(
                [
                    {
                        key: 'my_string',
                        value: 'Existing translation',
                        hash: 'hash(My string,A test string)',
                    },
                    {
                        key: 'my_string_without_description',
                        value: 'de(My string without description)',
                        hash: 'hash(My string without description)',
                    }
                ]
            )

            const nlEntries = fakeTranslationStore('nl').entries();
            expect(nlEntries).deep.eq(
                [
                    {
                        key: 'my_string',
                        value: 'Existing translation',
                        hash: 'hash(My string,A test string)',
                    },
                    {
                        key: 'my_string_without_description',
                        value: 'nl(My string without description)',
                        hash: 'hash(My string without description)',
                    }
                ]
            )

            // Expect 2 calls:
            // - my_string_without_description in German (because the hash does not match)
            // - my_string_without_description in Dutch (because it was not translated yet)
            expect(fakeTranslatorEngine.invocationCount()).eq(2);

            expect(fakeFormatter.writtenTranslations().length).eq(6);
        })

    test
        .do(() => initializeDependencies())
        .do(() => {
            // Assuming those strings were already translated and the hash matches
            fakeTranslationStore('de')
                .put('my_string_with_modified_key', 'Existing translation', 'hash(My string,A test string)');
        })
        .command(['translate', 'test/assets/cases/modifiedKey/mooi', '--openAiKey', 'fakeOpenAiKey'])
        .it('reuse values if only key has changed', ctx => {
            expect(storedLanguages()).to.have.members(['en', 'de']);

            const deEntries = fakeTranslationStore('de').entries();
            expect(deEntries).deep.eq(
                [
                    {
                        key: 'my_string',
                        value: 'Existing translation',
                        hash: 'hash(My string,A test string)',
                    },
                ]
            )

            expect(fakeTranslatorEngine.invocationCount()).eq(0);
            expect(fakeFormatter.writtenTranslations().length).eq(2);
        })

    test
        .do(() => initializeDependencies())
        .command(['translate', 'test/assets/cases/defaultOutput/mooi', '--openAiKey', 'fakeOpenAiKey'])
        .it('translate file in a project of unknown format', ctx => {
            expect(storedLanguages()).to.have.members(['en', 'de', 'nl']);

            const enEntries = fakeTranslationStore('en').entries();
            expect(enEntries).deep.eq(
                [
                    {
                        key: 'my_string',
                        value: 'My string',
                        hash: 'hash(My string,A test string)',
                    },
                    {
                        key: 'my_string_without_description',
                        value: 'My string without description',
                        hash: 'hash(My string without description)',
                    }
                ]
            )

            const deEntries = fakeTranslationStore('de').entries();
            expect(deEntries).deep.eq(
                [
                    {
                        key: 'my_string',
                        value: 'de(My string)',
                        hash: 'hash(My string,A test string)',
                    },
                    {
                        key: 'my_string_without_description',
                        value: 'de(My string without description)',
                        hash: 'hash(My string without description)',
                    }
                ]
            )

            const nlEntries = fakeTranslationStore('nl').entries();
            expect(nlEntries).deep.eq(
                [
                    {
                        key: 'my_string',
                        value: 'nl(My string)',
                        hash: 'hash(My string,A test string)',
                    },
                    {
                        key: 'my_string_without_description',
                        value: 'nl(My string without description)',
                        hash: 'hash(My string without description)',
                    }
                ]
            )

            // 2 languages * 2 entries
            expect(fakeTranslatorEngine.invocationCount()).eq(4);

            // 2 DE + 2 NL + 2 EN
            expect(fakeFormatter.writtenTranslations().length).eq(6);
        })

    test
        .do(() => initializeDependencies())
        .command(['translate', 'test/assets/cases/withFiles/mooi', '--openAiKey', 'fakeOpenAiKey'])
        .it('translate files along with regular entries', ctx => {
            expect(storedLanguages()).to.have.members(['en', 'de', 'nl', 'file_de', 'file_nl']);

            // Check regular entries
            const deEntries = fakeTranslationStore('de').entries();
            expect(deEntries).deep.eq(
                [
                    {
                        key: 'my_string',
                        value: 'de(My string)',
                        hash: 'hash(My string,A test string)',
                    },
                    {
                        key: 'my_button',
                        value: 'de(Click me)',
                        hash: 'hash(Click me,Button text)',
                    }
                ]
            )

            // Check file translations
            const fileDeEntries = fakeTranslationStore('file_de').entries();
            expect(fileDeEntries.length).eq(1);
            expect(fileDeEntries[0].key).includes('test.md');
            expect(fileDeEntries[0].value).includes('de(# Test Document');

            const fileNlEntries = fakeTranslationStore('file_nl').entries();
            expect(fileNlEntries.length).eq(1);
            expect(fileNlEntries[0].key).includes('test.md');
            expect(fileNlEntries[0].value).includes('nl(# Test Document');
        })

    test
        .do(() => initializeDependencies())
        .command(['translate', 'test/assets/cases/withGlobPattern/mooi', '--openAiKey', 'fakeOpenAiKey'])
        .it('translate multiple files using glob pattern', ctx => {
            expect(storedLanguages()).to.have.members(['en', 'de', 'nl', 'file_de', 'file_nl']);

            // Check file translations for multiple files
            const fileDeEntries = fakeTranslationStore('file_de').entries();
            expect(fileDeEntries.length).eq(2);
            
            const filePaths = fileDeEntries.map(e => e.key);
            expect(filePaths.some(p => p.includes('doc1.txt'))).to.be.true;
            expect(filePaths.some(p => p.includes('doc2.txt'))).to.be.true;

            // Check translations were applied
            expect(fileDeEntries[0].value).includes('de(');
            expect(fileDeEntries[1].value).includes('de(');
        })

    test
        .do(() => initializeDependencies())
        .command(['translate', 'test/assets/cases/withTags/mooi', '--includeTags', 'tagA,tagC', '--openAiKey', 'fakeOpenAiKey'])
        .it('translate only given tags', ctx => {
            expect(storedLanguages()).to.have.members(['en', 'nl']);

            const enEntries = fakeTranslationStore('en').entries();
            expect(enEntries).deep.eq(
                [
                    {
                        key: 'without_tag',
                        value: 'Without tag',
                        hash: 'hash(Without tag)',
                    },
                    {
                        key: 'with_tag',
                        value: 'String with a tag',
                        hash: 'hash(String with a tag)',
                    },
                    {
                        key: 'many_tags',
                        value: 'String with many tags',
                        hash: 'hash(String with many tags)',
                    },
                    {
                        key: 'wrong_tag',
                        value: 'String with a wrong tag',
                        hash: 'hash(String with a wrong tag)',
                    }
                ]
            )

            const nlEntries = fakeTranslationStore('nl').entries();
            expect(nlEntries).deep.eq(
                [
                    {
                        key: 'with_tag',
                        value: 'nl(String with a tag)',
                        hash: 'hash(String with a tag)',
                    },
                    {
                        key: 'many_tags',
                        value: 'nl(String with many tags)',
                        hash: 'hash(String with many tags)',
                    }
                ]
            )

            // 1 language * 2 entries
            expect(fakeTranslatorEngine.invocationCount()).eq(2);

            // 2 NL + 2 EN
            expect(fakeFormatter.writtenTranslations().length).eq(4);
        })
})
