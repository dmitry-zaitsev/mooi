import { DiParams } from ".";
import * as fs from 'fs';
import { Result, Err, Ok } from '@sniptt/monads';
import { readConfig } from "../input";

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

export const inferDiParams = async (context: InferDiContext): Promise<Result<DiParams, InferDiParamsError>> => {
    let inputDirectory = context.commandLineArgs.inputDirectory;
    if (!inputDirectory) {
        inputDirectory = './mooi';
    }

    if (!fs.existsSync(inputDirectory)) {
        return Err({
            message: `${inputDirectory} does not exist`
        });
    }

    const config = await readConfig(inputDirectory);

    return Ok({
        openAiApiKey: context.commandLineArgs.openAiApiKey || '',
        inputDirectory,
        config,
    });
}
