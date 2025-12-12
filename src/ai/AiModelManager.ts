import {AiModel} from "./core/AiModel.ts";
import {AiGlobalConfig} from "./AiGlobalConfig.ts";
import {SparkAiModel} from "./spark/SparkAiModel.ts";
import {WenXinAiModel} from "./wenxin/WenXinAiModel.ts";
import {CustomAiModel} from "./custom/CustomAiModel.ts";
import {OpenaiAiModel} from "./openai/OpenaiAiModel.ts";
import {InnerEditor} from "../core/AiEditor.ts";
import {GiteeAiModel} from "./gitee/GiteeAiModel.ts";
import {OpenRouterAiModel} from "./openrouter/OpenRouterAiModel.ts";
import {GeminiAiModel} from "./gemini/GeminiAiModel.ts";
import {ClaudeAiModel} from "./claude/ClaudeAiModel.ts";
import {DeepSeekAiModel} from "./deepseek/DeepSeekAiModel.ts";
import {OllamaAiModel} from "./ollama/OllamaAiModel.ts";
import {GrokAiModel} from "./grok/GrokAiModel.ts";

export class AiModelManager {

    private static models: Record<string, AiModel> = {};

    static init(editor: InnerEditor, globalConfig: AiGlobalConfig) {
        console.log('🏗️ Initializing AI Model Manager...');
        console.log('📋 Available models config:', globalConfig?.models);

        if (globalConfig && globalConfig.models) {
            for (let key of Object.keys(globalConfig.models)) {
                console.log(`🔧 Creating AI model: ${key}`);
                switch (key) {
                    case "spark":
                        this.set(key, new SparkAiModel(editor, globalConfig))
                        break;
                    case "wenxin":
                        this.set(key, new WenXinAiModel(editor, globalConfig))
                        break;
                    case "openai":
                        this.set(key, new OpenaiAiModel(editor, globalConfig))
                        break;
                    case "openrouter":
                        console.log('🚀 Creating OpenRouter model...');
                        const openRouterModel = new OpenRouterAiModel(editor, globalConfig);
                        this.set(key, openRouterModel);
                        console.log('✅ OpenRouter model created:', openRouterModel);
                        break;
                    case "gemini":
                        this.set(key, new GeminiAiModel(editor, globalConfig))
                        break;
                    case "claude":
                        this.set(key, new ClaudeAiModel(editor, globalConfig))
                        break;
                    case "deepseek":
                        this.set(key, new DeepSeekAiModel(editor, globalConfig))
                        break;
                    case "ollama":
                        this.set(key, new OllamaAiModel(editor, globalConfig))
                        break;
                    case "grok":
                        this.set(key, new GrokAiModel(editor, globalConfig))
                        break;
                    case "gitee":
                        this.set(key, new GiteeAiModel(editor, globalConfig))
                        break;
                    case "custom":
                        this.set(key, new CustomAiModel(editor, globalConfig))
                        break;
                    default:
                        const aiModel = globalConfig.modelFactory?.create(key, editor, globalConfig);
                        if (aiModel) this.set(key, aiModel);
                }
            }
        }

        console.log('📦 All AI models initialized:', this.models);
    }

    static get(modelName: string): AiModel {
        console.log(`🔍 Getting AI model: "${modelName}"`);
        console.log('📋 Available models:', Object.keys(this.models));

        if (!modelName || modelName === "auto") {
            modelName = Object.keys(this.models)[0];
            console.log(`🎯 Using auto-selected model: "${modelName}"`);
        }

        const model = this.models[modelName];
        console.log(`📤 Returning model "${modelName}":`, !!model);

        if (model) {
            console.log('🔧 Model config:', model.aiModelConfig);
        }

        return model;
    }

    static set(modelName: string, aiModel: AiModel) {
        this.models[modelName] = aiModel;
    }

}