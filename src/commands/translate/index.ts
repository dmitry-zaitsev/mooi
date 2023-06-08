import { Args, Command, Flags } from "@oclif/core";
import * as fs from 'fs';
import { App, inittializeDependencies } from "../../di";
import { readInputFolder } from "../../input";
import { TranslatorContext } from "../../translate";

export default class Translate extends Command {

    static args = {
        input: Args.directory({ description: 'Input directory', required: false }),
    }

    static flags = {
        openAiKey: Flags.string({ char: 'k', description: 'OpenAI API key', required: true }),
    }

    async run(): Promise<any> {
        const {args, flags} = await this.parse(Translate);

        let inputDirectory = args.input;
        if (!inputDirectory) {
            inputDirectory = './mooi';
        }

        if (!fs.existsSync(inputDirectory)) {
            this.error(`${inputDirectory} does not exist`);
        }

        inittializeDependencies({
            openAiApiKey: flags.openAiKey,
            inputDirectory: inputDirectory,
        })

        const inputModel = await readInputFolder(inputDirectory);

        const context: TranslatorContext = {
            rootDir: process.cwd(),
        }

        App.translator.translate(
            context,
            inputModel.languages,
            inputModel.entries,
        );
    }

}
