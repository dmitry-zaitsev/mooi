import { Config, InputSchema, validateConfig, validateInputSchema } from "./schema";
import yaml = require('js-yaml');
import fs = require('fs');

export const readInputFolder = async (inputPath: string): Promise<InputSchema> => {
    if (!fs.existsSync(inputPath)) {
        throw new Error(`Input path does not exist: ${inputPath}`);
    }

    if (!fs.lstatSync(inputPath).isDirectory()) {
        throw new Error(`Input path is not a directory: ${inputPath}`);
    }

    const files = fs.readdirSync(inputPath);

    const result: InputSchema = {
        languages: [],
        entries: [],
    };

    for (const file of files) {
        if (!file.endsWith('.yaml') || !file.endsWith('.yml')) {
            continue;
        }

        if (file === 'config.yaml' || file === 'config.yml') {
            continue;
        }

        if (!fs.lstatSync(`${inputPath}/${file}`).isFile()) {
            continue;
        }

        const subResult = await readSingleInput(`${inputPath}/${file}`);
        result.entries = result.entries.concat(subResult.entries);

        // TODO this will be surprising to the user if they have multiple files with different languages.
        // Report an error instead?
        result.languages = result.languages.concat(subResult.languages);
    }

    return result;
}

const readSingleInput = async (inputPath: string): Promise<InputSchema> => {
    const result = yaml.load(fs.readFileSync(inputPath, 'utf8'));

    const validationResult = validateInputSchema(result);

    if (!validationResult.valid) {
        throw new Error(`Invalid input schema: ${validationResult.errors.join(', ')}`);
    }

    return result as InputSchema;
}

export const readConfig = async (inputPath: string): Promise<Config | null> => {
    const configPath = fs.existsSync(`${inputPath}/config.yaml`) 
        ? `${inputPath}/config.yaml` 
        : `${inputPath}/config.yml`;

    if (!fs.existsSync(configPath)) {
        return null;
    }

    const result = yaml.load(fs.readFileSync(configPath, 'utf8'));

    const validationResult = validateConfig(result);

    if (!validationResult.valid) {
        throw new Error(`Invalid config: ${validationResult.errors.join(', ')}`);
    }

    return result as Config;
}
