import {AiModelConfig} from "../core/AiModelConfig.ts";

export interface OllamaModelConfig extends AiModelConfig {
    endpoint?: string,
    customUrl?: string | (() => string),
    model: string
}
