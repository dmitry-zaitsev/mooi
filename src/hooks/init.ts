import {Hook} from '@oclif/core'
import { App, underTest } from '../di'
import { OpenaiTranslatorEngine } from '../translate/engine/openai';
import { sha1HashFunction } from '../crypto';
import { createDiskTranslationStoreFactory } from '../store';
import { NoopFormatter } from '../output';

const hook: Hook<'init'> = async function (options) {
    if (underTest) {
        return;
    }
    
    App.initialize({
        translatorEngine: new OpenaiTranslatorEngine(),
        hashFunction: sha1HashFunction,
        translationStoreFactory: createDiskTranslationStoreFactory('playground/input'),  // TODO make configurable
        outputFormatter: new NoopFormatter(),   // TODO pass actual formatter and make it configurable
    });
}

export default hook