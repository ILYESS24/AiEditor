import {AiClient} from "../core/AiClient.ts";
import {AiMessageListener} from "../core/AiMessageListener.ts";
import {AiModel} from "../core/AiModel.ts";
import {AiGlobalConfig} from "../AiGlobalConfig.ts";
import {GeminiModelConfig} from "./GeminiModelConfig.ts";
import {SseClient} from "../core/client/sse/SseClient.ts";
import {InnerEditor} from "../../core/AiEditor.ts";


export class GeminiAiModel extends AiModel {

    constructor(editor: InnerEditor, globalConfig: AiGlobalConfig) {
        super(editor, globalConfig, "gemini");
        this.aiModelConfig = {
            endpoint: "https://generativelanguage.googleapis.com",
            // model: "gemini-pro",
            ...globalConfig.models?.gemini
        } as GeminiModelConfig;
    }

    createAiClient(url: string, listener: AiMessageListener): AiClient {
        return new SseClient({
            url,
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
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

                if (!message.candidates || message.candidates.length === 0) {
                    return;
                }

                const candidate = message.candidates[0];
                if (!candidate.content || !candidate.content.parts) {
                    return;
                }

                const content = candidate.content.parts[0]?.text || "";

                listener.onMessage({
                    status: candidate.finishReason === "STOP" ? 2 : 1,
                    role: "assistant",
                    content: content,
                    index: 0,
                })

                // Gestion de la consommation de tokens si disponible
                if (this.globalConfig.onTokenConsume && message.usageMetadata?.totalTokenCount) {
                    this.globalConfig.onTokenConsume(this.aiModelName, this.aiModelConfig!, message.usageMetadata.totalTokenCount)
                }
            }
        });
    }

    wrapPayload(prompt: string) {
        const config = this.aiModelConfig as GeminiModelConfig;
        const payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": config.temperature || 0.7,
                "maxOutputTokens": config.maxTokens || 2048,
                "topP": 0.8,
                "topK": 10
            }
        }

        return JSON.stringify(payload);
    }

    createAiClientUrl(): string {
        const config = this.aiModelConfig as GeminiModelConfig;
        if (config.customUrl) {
            if (typeof config.customUrl === "string") {
                return config.customUrl;
            } else if (typeof config.customUrl === "function") {
                return config.customUrl();
            }
        }

        const model = config.model || "gemini-pro";
        const apiKey = config.apiKey;

        if (!apiKey) {
            throw new Error("Gemini API key is required");
        }

        return `${config.endpoint}/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
    }


}
