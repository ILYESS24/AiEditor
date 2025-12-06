import {AiClient} from "../core/AiClient.ts";
import {AiMessageListener} from "../core/AiMessageListener.ts";
import {AiModel} from "../core/AiModel.ts";
import {AiGlobalConfig} from "../AiGlobalConfig.ts";
import {ClaudeModelConfig} from "./ClaudeModelConfig.ts";
import {SseClient} from "../core/client/sse/SseClient.ts";
import {InnerEditor} from "../../core/AiEditor.ts";


export class ClaudeAiModel extends AiModel {

    constructor(editor: InnerEditor, globalConfig: AiGlobalConfig) {
        super(editor, globalConfig, "claude");
        this.aiModelConfig = {
            endpoint: "https://api.anthropic.com",
            // model: "claude-3-haiku-20240307",
            ...globalConfig.models?.claude
        } as ClaudeModelConfig;
    }

    createAiClient(url: string, listener: AiMessageListener): AiClient {
        const config = this.aiModelConfig as ClaudeModelConfig;
        const headers = {
            "Content-Type": "application/json",
            "anthropic-version": config.apiVersion || "2023-06-01",
        } as any;

        if (config.apiKey) {
            headers["x-api-key"] = config.apiKey;
        }

        return new SseClient({
            url,
            method: "post",
            headers,
        }, {
            onStart: listener.onStart,
            onStop: listener.onStop,
            onMessage: (bodyString: string) => {
                // Anthropic utilise des événements SSE avec un format différent
                const lines = bodyString.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            continue;
                        }

                        let message = null;
                        try {
                            message = JSON.parse(data);
                        } catch (err) {
                            console.error("error parsing Claude response", err, data);
                            return;
                        }

                        if (message.type === 'content_block_delta' && message.delta?.text) {
                            listener.onMessage({
                                status: 1, // Continue streaming
                                role: "assistant",
                                content: message.delta.text,
                                index: 0,
                            });
                        } else if (message.type === 'message_stop') {
                            listener.onMessage({
                                status: 2, // Finished
                                role: "assistant",
                                content: "",
                                index: 0,
                            });
                        }

                        // Gestion de la consommation de tokens si disponible
                        if (this.globalConfig.onTokenConsume && message.usage?.total_tokens) {
                            this.globalConfig.onTokenConsume(this.aiModelName, this.aiModelConfig!, message.usage.total_tokens);
                        }
                    }
                }
            }
        });
    }

    wrapPayload(prompt: string) {
        const config = this.aiModelConfig as ClaudeModelConfig;
        const payload = {
            "model": config.model || "claude-3-haiku-20240307",
            "max_tokens": config.maxTokens || 4096,
            "temperature": config.temperature || 0.7,
            "system": "You are a helpful assistant integrated into a rich text editor. Provide clear, concise responses suitable for text editing contexts.",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "stream": true
        };

        return JSON.stringify(payload);
    }

    createAiClientUrl(): string {
        const config = this.aiModelConfig as ClaudeModelConfig;
        if (config.customUrl) {
            if (typeof config.customUrl === "string") {
                return config.customUrl;
            } else if (typeof config.customUrl === "function") {
                return config.customUrl();
            }
        }

        return `${config.endpoint}/v1/messages`;
    }


}
