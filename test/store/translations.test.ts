import * as fs from 'fs';
import { DiskTranslationsStore } from '../../src/store';
import { expect } from 'chai';
const fse = require('fs-extra');


function inTestFolder(input: string): string {
    const tmpDestination = `tmp/${input}`;
    if (fs.existsSync(tmpDestination)) {
        fs.rmdirSync(tmpDestination, { recursive: true });
    }

    fse.mkdirSync(tmpDestination, { recursive: true });

    return tmpDestination;
}

function cleanUpTest(): void {
    if (!fs.existsSync('tmp')) {
        return;
    }
    fs.rmdirSync('tmp', { recursive: true });
}

describe('DiskTranslationsStore', () => {
    afterEach(() => {
        cleanUpTest();
    });

    it('should create a cache file if it does not exist', () => {
        // Given
        const tmpDestination = inTestFolder('storage');

        // When
        new DiskTranslationsStore(tmpDestination, 'en');

        // Then
        expect(fs.existsSync(`${tmpDestination}/translations/translations_en.yaml`)).to.be.true;
    });

    it('should load the cache file if it exists', () => {
        // Given
        const tmpDestination = inTestFolder('storage');
        const storeA = new DiskTranslationsStore(tmpDestination, 'en');
        storeA.put('key', 'value', 'hash');

        // When
        const storeB = new DiskTranslationsStore(tmpDestination, 'en');

        // Then
        expect(storeB.entries()).to.deep.eq([
            {
                key: 'key',
                value: 'value',
                hash: 'hash',
            }
        ]);
    });

    it('should upsert on add', () => {
        // Given
        const tmpDestination = inTestFolder('storage');
        const store = new DiskTranslationsStore(tmpDestination, 'en');
        store.put('key', 'value', 'hash');

        // When
        store.put('key', 'value2', 'hash2');

        // Then
        expect(store.entries()).to.deep.eq([
            {
                key: 'key',
                value: 'value2',
                hash: 'hash2',
            }
        ]);
    });
})
