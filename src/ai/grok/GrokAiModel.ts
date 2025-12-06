import {AiClient} from "../core/AiClient.ts";
import {AiMessageListener} from "../core/AiMessageListener.ts";
import {AiModel} from "../core/AiModel.ts";
import {AiGlobalConfig} from "../AiGlobalConfig.ts";
import {GrokModelConfig} from "./GrokModelConfig.ts";
import {SseClient} from "../core/client/sse/SseClient.ts";
import {InnerEditor} from "../../core/AiEditor.ts";


export class GrokAiModel extends AiModel {

    constructor(editor: InnerEditor, globalConfig: AiGlobalConfig) {
        super(editor, globalConfig, "grok");
        this.aiModelConfig = {
            endpoint: "https://api.x.ai",
            // model: "grok-beta",
            ...globalConfig.models?.grok
        } as GrokModelConfig;
    }

    createAiClient(url: string, listener: AiMessageListener): AiClient {
        const config = this.aiModelConfig as GrokModelConfig;
        const headers = {
            "Content-Type": "application/json",
        } as any
        if (config.apiKey) {
            headers["Authorization"] = `Bearer ${config.apiKey}`;
        }

        return new SseClient({
            url,
            method: "post",
            headers,
        }, {
            onStart: listener.onStart,
            onStop: listener.onStop,
            onMessage: (bodyString: string) => {
                let message = null;
                try {
                    message = JSON.parse(bodyString);
                } catch (err) {
                    console.error("error", err, bodyString);
                    return;
                }

                if (!message.choices || message.choices.length === 0) {
                    return;
                }

                listener.onMessage({
                    status: message.choices[0].finish_reason === "stop" ? 2 : 1,
                    role: "assistant",
                    content: message.choices[0].delta?.content || "",
                    index: message.choices[0].index,
                })

                // Gestion de la consommation de tokens si disponible
                if (this.globalConfig.onTokenConsume && message.usage?.total_tokens) {
                    this.globalConfig.onTokenConsume(this.aiModelName, this.aiModelConfig!, message.usage.total_tokens)
                }
            }
        });
    }

    wrapPayload(prompt: string) {
        const config = this.aiModelConfig as GrokModelConfig;
        const payload = {
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            "max_tokens": config.maxTokens || 4096,
            "temperature": config.temperature || 0.7,
            "stream": true
        } as any

        if (config.model) {
            payload.model = config.model;
        }

        return JSON.stringify(payload);
    }

    createAiClientUrl(): string {
        const config = this.aiModelConfig as GrokModelConfig;
        if (config.customUrl) {
            if (typeof config.customUrl === "string") {
                return config.customUrl;
            } else if (typeof config.customUrl === "function") {
                return config.customUrl();
            }
        }

        return `${config.endpoint}/v1/chat/completions`;
    }


}
