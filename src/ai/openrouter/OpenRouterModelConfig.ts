import {AiModelConfig} from "../core/AiModelConfig.ts";

export interface OpenRouterModelConfig extends AiModelConfig {
    endpoint?: string,
    customUrl?: string | (() => string),
    apiKey?: string,
    model: string
}
