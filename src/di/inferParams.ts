import { DiParams } from ".";
import * as fs from 'fs';
import { Result, Err, Ok } from '@sniptt/monads';

interface InferDiContext {
    commandLineArgs: CommandLineArgs;
}

interface CommandLineArgs {
    openAiApiKey?: string;
    inputDirectory?: string;
}

export interface InferDiParamsError {
    message: string;
}

export const inferDiParams = (context: InferDiContext): Result<DiParams, InferDiParamsError> => {
    let inputDirectory = context.commandLineArgs.inputDirectory;
    if (!inputDirectory) {
        inputDirectory = './mooi';
    }

    if (!fs.existsSync(inputDirectory)) {
        return Err({
            message: `${inputDirectory} does not exist`
        });
    }

    return Ok({
        openAiApiKey: context.commandLineArgs.openAiApiKey || '',
        inputDirectory: inputDirectory,
    });
}
