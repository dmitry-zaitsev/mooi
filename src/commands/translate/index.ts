import { Args, Command, Flags } from "@oclif/core";
import { App, inittializeDependencies } from "../../di";
import { readInputFolder } from "../../input";
import { TranslatorContext } from "../../translate";
import { logger } from "../../util/logging";
import { inferDiParams } from "../../di/inferParams";

export default class Translate extends Command {

    static args = {
        input: Args.directory({ description: 'Input directory', required: false }),
    }

    static flags = {
        openAiKey: Flags.string({ char: 'k', description: 'OpenAI API key', required: false }),
    }

    async run(): Promise<any> {
        logger.info('Running translate command');

        const {args, flags} = await this.parse(Translate);

        const diParamsResult = inferDiParams({
            commandLineArgs: {
                openAiApiKey: flags.openAiKey,
                inputDirectory: args.input,
            }
        });

        if (diParamsResult.isErr()) {
            this.error(diParamsResult.unwrapErr().message);
        }

        inittializeDependencies(diParamsResult.unwrap());

        const inputModel = await readInputFolder(App.inputDirectory);

        const context: TranslatorContext = {
            rootDir: process.cwd(),
            inputDir: App.inputDirectory,
        }

        App.translator.translate(
            context,
            inputModel.languages,
            inputModel.entries,
        );
    }

}
