import {AiClient} from "../core/AiClient.ts";
import {AiMessageListener} from "../core/AiMessageListener.ts";
import {AiModel} from "../core/AiModel.ts";
import {AiGlobalConfig} from "../AiGlobalConfig.ts";
import {OllamaModelConfig} from "./OllamaModelConfig.ts";
import {SseClient} from "../core/client/sse/SseClient.ts";
import {InnerEditor} from "../../core/AiEditor.ts";


export class OllamaAiModel extends AiModel {

    constructor(editor: InnerEditor, globalConfig: AiGlobalConfig) {
        super(editor, globalConfig, "ollama");
        this.aiModelConfig = {
            endpoint: "http://localhost:11434",
            // model: "llama2",
            ...globalConfig.models?.ollama
        } as OllamaModelConfig;
    }

    createAiClient(url: string, listener: AiMessageListener): AiClient {
        const headers = {
            "Content-Type": "application/json",
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

                if (message.done) {
                    listener.onMessage({
                        status: 2, // Finished
                        role: "assistant",
                        content: "",
                        index: 0,
                    });
                    return;
                }

                if (message.response) {
                    listener.onMessage({
                        status: 1, // Continue streaming
                        role: "assistant",
                        content: message.response,
                        index: 0,
                    });
                }

                // Gestion de la consommation de tokens si disponible
                if (this.globalConfig.onTokenConsume && message.eval_count) {
                    this.globalConfig.onTokenConsume(this.aiModelName, this.aiModelConfig!, message.eval_count);
                }
            }
        });
    }

    wrapPayload(prompt: string) {
        const config = this.aiModelConfig as OllamaModelConfig;
        const payload = {
            "model": config.model || "llama2",
            "prompt": prompt,
            "stream": true,
            "options": {
                "temperature": config.temperature || 0.7,
                "num_predict": config.maxTokens || 2048,
            }
        }

        return JSON.stringify(payload);
    }

    createAiClientUrl(): string {
        const config = this.aiModelConfig as OllamaModelConfig;
        if (config.customUrl) {
            if (typeof config.customUrl === "string") {
                return config.customUrl;
            } else if (typeof config.customUrl === "function") {
                return config.customUrl();
            }
        }

        return `${config.endpoint}/api/generate`;
    }


}
