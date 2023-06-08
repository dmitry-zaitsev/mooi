import { Configuration, OpenAIApi } from "openai";
import { ProductCopy } from "../../input";
import { TranlsatorEngine } from "./engine";
const dJSON = require('dirty-json');

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
                model: 'gpt-4',
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
            throw new Error('No response from OpenAI');
        }

        let jsonResponse: any = null;
        try {
            const jsonRegex = /{[\s\S]*}/;
            const matches = aiMessage.match(jsonRegex);
            if (!matches) {
                throw new Error('No JSON found in response');
            }
            const jsonString = matches[0];
    
            jsonResponse = dJSON.parse(jsonString);
        } catch (e) {
            console.log(`Failed to parse JSON from Open AI response: ${aiMessage}`)
            throw e
        }

        return jsonResponse.translations.map((t: any) => t.value);
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

        I will only reply with json without backticks. You can provide an input now.
    `
}
