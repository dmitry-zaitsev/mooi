import Handlebars = require("handlebars");
import { FormatConfig, readConfig } from "../input";
import { Formatter, FormatterContext } from "./formatter";
import { Translation } from "./schema";
import * as fs from 'fs';
const fse = require('fs-extra');


export class YamlBasedFormatter implements Formatter {
    
    public async write(context: FormatterContext, translations: Translation[]): Promise<void> {
        const config = await readConfig(context.inputDir);
        if (!config?.formats) {
            return;
        }

        this.verifyNoDuplicateDefaultFormats(config.formats);

        let format: FormatConfig | undefined;
        if (context.formatName) {
            format = config.formats.find(format => format.name === context.formatName);
            if (!format) {
                throw new Error(`Format with name ${context.formatName} not found`);
            }
        } else {
            format = this.inferFormat(context, config.formats);
        }

        if (!format) {
            return;
        }

        const outputPathTemplate = Handlebars.compile(format.outputPath);
        const contentTemplate = Handlebars.compile(format.format);

        const translationsByLanguageCode: Map<string, Translation[]> = new Map();
        for (const translation of translations) {
            const translationsForLanguage = translationsByLanguageCode.get(translation.languageCode) ?? [];
            translationsForLanguage.push(translation);
            translationsByLanguageCode.set(translation.languageCode, translationsForLanguage);
        }

        for (const [languageCode, translationsForLanguage] of translationsByLanguageCode) {
            const content = contentTemplate({
                languageCode,
                translations: translationsForLanguage,
            });

            const outputPath = outputPathTemplate({
                languageCode,
            });

            fse.ensureFileSync(outputPath);

            fs.writeFileSync(outputPath, content);
        }
    }

    private inferFormat(context: FormatterContext, formats: FormatConfig[]): FormatConfig | undefined {
        for (const format of formats) {
            if (format.useWhen?.tagsInclude) {
                const tags = context.includedTags ?? [];

                if (format.useWhen.tagsInclude.every(tag => tags.includes(tag))) {
                    return format;
                }
            }
        }

        return formats.find(format => !format.name || format.name === 'default');
    }

    private verifyNoDuplicateDefaultFormats(formats: FormatConfig[]) {
        const defaultFormats = formats.filter(format => {
            if (format.useWhen) {
                return false;
            }

            return !format.name || format.name === 'default';
        });

        if (defaultFormats.length > 1) {
            throw new Error(`Only one format can be named default`);
        }
    }

}