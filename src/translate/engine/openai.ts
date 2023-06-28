import { Configuration, OpenAIApi } from "openai";
import { ProductCopy } from "../../input";
import { TranlsatorEngine } from "./engine";
import { logger } from "../../util/logging";
const dJSON = require('dirty-json');

const MODEL = 'gpt-4'

interface OpenaiEngineConfig {
    apiKey: string;
    baseUrl?: string;
    urlParams?: Record<string, string>;
}

export class OpenaiTranslatorEngine implements TranlsatorEngine {

    private openAi: OpenAIApi

    constructor(config: OpenaiEngineConfig) {
        this.openAi = new OpenAIApi(new Configuration({
            apiKey: config.apiKey,
            basePath: config.baseUrl,
            baseOptions: {
                headers: {
                    'api-key': config.apiKey,
                },
                params: {
                    ...config.urlParams,
                }
            }
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
            const jsonRegex = /\[[\s\S]*\]/;
            const matches = aiMessage.match(jsonRegex);
            if (!matches) {
                throw new Error('No JSON found in response');
            }
            const jsonString = matches[0];
    
            const jsonResponse = dJSON.parse(jsonString);

            if (Array.isArray(jsonResponse)) {
                translations = jsonResponse;
            } else {
                throw new Error('No translations found in JSON model');
            }
        } catch (e) {
            logger.error(`Failed to parse JSON from Open AI response: ${aiMessage}`, e);
            console.error(`Failed to parse JSON from Open AI response: ${aiMessage}`);
            throw e
        }

        // Validate that each value is a string
        translations.forEach((t: any) => {
            if (typeof t.value !== 'string') {
                logger.error(`Invalid translation value: ${t.value}`, aiMessage);
                throw new Error(`Invalid translation value: ${t.value}`);
            }
        });

        return translations.map((t: any) => {
            return t.value;
        });
    }

    public maxBatchSize(): number {
        return 3;
    }
        
}

const PROMPTS = {
    init: (sourceLanguage: string, targetLanguage: string) => `
        I want you to translate some strings from language code {{SOURCE_LANGUAGE}} to language code {{TARGET_LANGUAGE}}.
        Respond with JSON in the following schema. 

        [
            {
                "key": "inputKey1",
                "value": "translatedValue1"
            }
        ]
        
        Do include the reply.
    `
        .replace('{{SOURCE_LANGUAGE}}', sourceLanguage)
        .replace('{{TARGET_LANGUAGE}}', targetLanguage),
    initResponse: (sourceLanguage: string, targetLanguage: string) => `
        I will translate strings from language code {{SOURCE_LANGUAGE}} to language code {{TARGET_LANGUAGE}}. I will provide output in the following format:

        \`\`\`
        [
            {
                "key": "inputKey1",
                "value": "translatedValue1"
            }
        ]
        \`\`\`

        I will not include the reply. You can provide an input now.
    `
        .replace('{{SOURCE_LANGUAGE}}', sourceLanguage)
        .replace('{{TARGET_LANGUAGE}}', targetLanguage),
}
