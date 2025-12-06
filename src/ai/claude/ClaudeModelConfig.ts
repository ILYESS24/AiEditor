import {AiModelConfig} from "../core/AiModelConfig.ts";

export interface ClaudeModelConfig extends AiModelConfig {
    endpoint?: string,
    customUrl?: string | (() => string),
    apiKey?: string,
    model: string,
    apiVersion?: string
}
