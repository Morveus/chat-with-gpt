import { FormattedMessage } from "react-intl";
import Plugin from "../core/plugins";
import { PluginDescription } from "../core/plugins/plugin-description";
import { OpenAIMessage, Parameters } from "../core/chat/types";

export const defaultSystemPrompt = `
You are GPT, a large language model trained by OpenAI.

The person you're talking to is David Balland, an engineer born in May 1988. Please consider this when replying, try to keep your answers short unless specifically asked to go deeper.
For instance, when providing command lines or code, you don't need to bother with anything else than the code snippets. Also, please note David is French and understands English too, if that can help.

Knowledge cutoff: 2021-09
Current date and time: {{ datetime }}
`.trim();

export interface SystemPromptPluginOptions {
    systemPrompt: string;
}

export class SystemPromptPlugin extends Plugin<SystemPromptPluginOptions> {
    describe(): PluginDescription {
        return {
            id: "system-prompt",
            name: "System Prompt",
            options: [
                {
                    id: "systemPrompt",
                    defaultValue: defaultSystemPrompt,
                    displayOnSettingsScreen: "chat",
                    resettable: true,
                    scope: "chat",
                    renderProps: {
                        type: "textarea",
                        description: <p>
                            <FormattedMessage defaultMessage={"The System Prompt is an invisible message inserted at the start of the chat and can be used to give ChatGPT information about itself and general guidelines for how it should respond. The <code>'{{ datetime }}'</code> tag is automatically replaced by the current date and time (use this to give the AI access to the time)."}
                                values={{ code: v => <code>{v}</code> }} />
                        </p>,
                    },
                    displayInQuickSettings: {
                        name: "System Prompt",
                        displayByDefault: true,
                        label: "Customize system prompt",
                    },
                },
            ],
        };
    }

    async preprocessModelInput(messages: OpenAIMessage[], parameters: Parameters): Promise<{ messages: OpenAIMessage[]; parameters: Parameters; }> {
        const output = [
            {
                role: 'system',
                content: (this.options?.systemPrompt || defaultSystemPrompt)
                    .replace('{{ datetime }}', new Date().toLocaleString()),
            },
            ...messages,
        ];

        return {
            messages: output,
            parameters,
        };
    }
}