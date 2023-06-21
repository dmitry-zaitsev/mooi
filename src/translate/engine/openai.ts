import { Configuration, OpenAIApi } from "openai";
import { ProductCopy } from "../../input";
import { TranlsatorEngine } from "./engine";
import { logger } from "../../util/logging";
const dJSON = require('dirty-json');

const MODEL = 'gpt-4'

export class OpenaiTranslatorEngine implements TranlsatorEngine {

    private openAi: OpenAIApi

    constructor(apiKey: string) {
        this.openAi = new OpenAIApi(new Configuration({
            apiKey
        }));
    }
    
    public async translate(input: ProductCopy[], languageCode: string): Promise<string[]> {
        const completionResponse = await this.openAi.createChatCompletion(
            {
                model: MODEL,
                messages: [
                    {
                        role: 'user',
                        content: PROMPTS.init('en', languageCode)
                    },
                    {
                        role: 'assistant',
                        content: PROMPTS.initResponse('en', languageCode)
                    },
                    {
                        role: 'user',
                        content: JSON.stringify(input)
                    }
                ]
            }
        );

        const aiMessage = completionResponse.data
            .choices[0]
            .message
            ?.content

        if (!aiMessage) {
            logger.error(`No response from OpenAI`, completionResponse);
            throw new Error('No response from OpenAI');
        }

        logger.info(`OpenAI response: ${aiMessage}`);

        let translations: any = null;
        try {
            const jsonRegex = /{[\s\S]*}/;
            const matches = aiMessage.match(jsonRegex);
            if (!matches) {
                throw new Error('No JSON found in response');
            }
            const jsonString = matches[0];
    
            const jsonResponse = dJSON.parse(jsonString);

            if (jsonResponse.translations) {
                translations = jsonResponse.translations;
            } else if (Array.isArray(jsonResponse)) {
                translations = jsonResponse;
            } else {
                throw new Error('No translations found in JSON model');
            }
        } catch (e) {
            logger.error(`Failed to parse JSON from Open AI response: ${aiMessage}`, e);
            console.error(`Failed to parse JSON from Open AI response: ${aiMessage}`);
            throw e
        }

        return translations.map((t: any) => {
            // Sometimes GPT wraps the value in an object
            if (t.value.value) {
                return t.value.value;
            }

            return t.value;
        });
    }

    public maxBatchSize(): number {
        return 5;
    }
        
}

const PROMPTS = {
    init: (sourceLanguage: string, targetLanguage: string) => `
        I want you to translate some strings from language code {{SOURCE_LANGUAGE}} to language code {{TARGET_LANGUAGE}}.
        Do not reply. Just translate the strings in some format.
    `
        .replace('{{SOURCE_LANGUAGE}}', sourceLanguage)
        .replace('{{TARGET_LANGUAGE}}', targetLanguage),
    initResponse: (sourceLanguage: string, targetLanguage: string) => `
        I will translate strings from language code {{SOURCE_LANGUAGE}} to language code {{TARGET_LANGUAGE}}. I will provide output in the following format:

        \`\`\`
        {
            "translations": [
                {
                    "key": "inputKey1",
                    "value": "translatedValue1"
                }
            ]
        }
        \`\`\`

        I will only reply with JSON. You can provide an input now.
    `
        .replace('{{SOURCE_LANGUAGE}}', sourceLanguage)
        .replace('{{TARGET_LANGUAGE}}', targetLanguage),
}
