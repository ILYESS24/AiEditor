import {AiModelConfig} from "../core/AiModelConfig.ts";

export interface GeminiModelConfig extends AiModelConfig {
    endpoint?: string,
    customUrl?: string | (() => string),
    apiKey?: string,
    model: string
}
