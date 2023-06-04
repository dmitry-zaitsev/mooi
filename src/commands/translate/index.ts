import { Args, Command, Flags } from "@oclif/core";
import * as fs from 'fs';
import { App } from "../../di";
import { readInputFolder } from "../../input";

export default class Translate extends Command {

    static args = {
        input: Args.directory({ description: 'Input directory', required: false }),
    }

    static flags = {
        openAiKey: Flags.string({ char: 'k', description: 'OpenAI API key', required: false }),
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

        const inputModel = await readInputFolder(inputDirectory);

        App.translator.translate(
            inputModel.languages,
            inputModel.entries,
        );
    }

}
