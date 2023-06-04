import {expect, test} from '@oclif/test'
import {App, setUnderTest} from '../../../src/di';
import { FakeTranslatorEngine } from '../../fake/engine';
import { fakeTranslationStore, fakeTranslationStoreFactory, storedLanguages } from '../../fake/translations';
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
    test
        .do(() => initializeDependencies())
        .command(['translate', 'test/assets/cases/defaultOutput/mooi'])
        .it('translate file in a project of unknown format', ctx => {
            expect(storedLanguages()).to.have.members(['de', 'nl']);

            const deEntries = fakeTranslationStore('de').entries();
            expect(deEntries).deep.eq(
                [
                    {
                        key: 'my_string',
                        value: 'de(My string)',
                        hash: 'hash(my_string,My string,A test string)',
                    },
                    {
                        key: 'my_string_without_description',
                        value: 'de(My string without description)',
                        hash: 'hash(my_string_without_description,My string without description)',
                    }
                ]
            )

            const nlEntries = fakeTranslationStore('nl').entries();
            expect(nlEntries).deep.eq(
                [
                    {
                        key: 'my_string',
                        value: 'nl(My string)',
                        hash: 'hash(my_string,My string,A test string)',
                    },
                    {
                        key: 'my_string_without_description',
                        value: 'nl(My string without description)',
                        hash: 'hash(my_string_without_description,My string without description)',
                    }
                ]
            )

            // 2 languages * 2 entries
            expect(fakeTranslatorEngine.invocationCount()).eq(4);

            expect(fakeFormatter.writtenTranslations().length).eq(4);
        })
})
