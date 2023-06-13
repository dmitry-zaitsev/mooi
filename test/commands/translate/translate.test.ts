import {expect, test} from '@oclif/test'
import {App, setUnderTest} from '../../../src/di';
import { FakeTranslatorEngine } from '../../fake/engine';
import { clearTranslationStores, fakeTranslationStore, fakeTranslationStoreFactory, storedLanguages } from '../../fake/translations';
import { FakeFormatter } from '../../fake/formatter';
import { fakeHashFunction } from '../../fake/hash';


let fakeTranslatorEngine: FakeTranslatorEngine;
let fakeFormatter: FakeFormatter;

function initializeDependencies(): void {
    setUnderTest();

    fakeTranslatorEngine = new FakeTranslatorEngine();
    fakeFormatter = new FakeFormatter();

    App.initialize({
        translatorEngine: fakeTranslatorEngine,
        translationStoreFactory: fakeTranslationStoreFactory,
        outputFormatter: fakeFormatter,
        hashFunction: fakeHashFunction,
    })
}

describe('mooi translate', () => {
    beforeEach(() => {
        clearTranslationStores();
    });

    test
        .do(() => initializeDependencies())
        .command(['translate', 'test/assets/cases/defaultOutput/mooi', '--openAiKey', 'fakeOpenAiKey'])
        .it('translate file in a project of unknown format', ctx => {
            expect(storedLanguages()).to.have.members(['de', 'nl']);

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

            expect(fakeFormatter.writtenTranslations().length).eq(4);
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
            expect(storedLanguages()).to.have.members(['de', 'nl']);

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

            expect(fakeFormatter.writtenTranslations().length).eq(4);
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
            expect(storedLanguages()).to.have.members(['de']);

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
            expect(fakeFormatter.writtenTranslations().length).eq(1);
        })
})
