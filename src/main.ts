// import { openai } from "./chatgpt.ts";
import {AiEditor} from "./core/AiEditor.ts";
import {AiModelManager} from "./ai/AiModelManager.ts";
// import { config } from "./spark.ts";
// import {OpenaiModelConfig} from "./ai/openai/OpenaiModelConfig.ts";
// @ts-ignore
window.aiEditor = new AiEditor({
    element: "#aiEditor",
    placeholder: "Click to input content...",
    lang: "en",
    contentRetention: true,
    // toolbarSize: 'small',
    // toolbarSize:'large',
    // pasteAsText: true,
    // draggable:false,
    // theme: "dark",
    // editable:false,
    content: 'AiEditor is a next-generation rich text editor for AI.',
    // contentIsMarkdown: true,
    textSelectionBubbleMenu: {
        // enable:false
        //[AI, Bold, Italic, Underline, Strike, Code]
        // items: ["ai", "Bold", "Italic", "Underline", "Strike", "code"],
    },

    container: {
        defaultType: "default",
        typeItems: ["default", 'info', 'warning', 'danger',]
    },

    // toolbarKeys: ["undo", "redo", "brush", "eraser", "divider", "heading", "font-family", "font-size", "divider", "bold", "italic", "underline"
    //     , "strike", "link", "code", "subscript", "superscript", "hr", "todo", "emoji", "divider", "highlight", "font-color", "divider"
    //     , "align", "line-height", "divider", "bullet-list", "ordered-list", "indent-decrease", "indent-increase", "break", "divider"
    //     , "image", "video", "attachment", "quote", "container", "code-block", "table", "divider", "source-code", "printer", "fullscreen",
    //     {
    //         // title:"test",
    //         toolbarKeys: ["undo", "redo", "brush", "font-color", "line-height"]
    //     },
    //     "ai",
    // ],
    // toolbarExcludeKeys: ["undo", "redo", "brush", "eraser", "heading", "font-family", "font-size"],

    // fontSize:{
    //     defaultValue:18
    // },
    image: {
        //[AlignLeft, AlignCenter, AlignRight, Delete]
        // bubbleMenuEnable:false,
        // bubbleMenuItems: ["AlignLeft", "AlignCenter", "AlignRight", "delete"]
    },
    // textCounter: (text) => {
    //     // console.log("counter", text)
    //     return text.length;
    // },

    attachment:{
        uploadUrl: "/v1/upload/image",
    },

    link: {
        //[Edit, UnLink, Visit]
        bubbleMenuItems: ["Edit", "UnLink", "visit"],
    },
    selectionBubbleMenu: {
        items: ["translate", "ai-continuation", "ai-optimization", "ai-proofreading"],
    },
    codeBlock: {
        languages: [
            {name: 'Auto', value: 'auto'},
            {name: 'Plain Text', value: 'plaintext', alias: ['text', 'txt']},
            {name: 'Bash', value: 'bash', alias: ['sh']},
            {name: 'BASIC', value: 'basic', alias: []},
            {name: 'C', value: 'c', alias: ['h']},
            {name: 'Clojure', value: 'clojure', alias: ['clj', 'edn']},
            {name: 'CMake', value: 'cmake', alias: ['cmake.in']},
        ]
    },
    // htmlPasteConfig: {
    //     pasteAsText: true,
    //     pasteClean: false,
    //     pasteProcessor: (html) => {
    //         return html;
    //     }
    // },
    emoji: {
        // values:['😀', '😃', '😄', '😁', '😆', '😅',],
    },
    // lineHeight:{
    //     values:["1.0","1.1"],
    // },
    // onSave:()=>{
    //     alert("Save")
    //     return true;
    // },
    // image:{
    //     uploadUrl:"http://localhost:8080/api/v1/aieditor/upload/image"
    // },
    ai: {
        models: {
            openrouter: {
                apiKey: "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",
                model: localStorage.getItem('aiModel') || "anthropic/claude-3-haiku",
                maxTokens: 2000,
                temperature: 0.7
            }
        },
        bubblePanelModel: "openrouter",
        onTokenConsume: (modelName, _modelConfig, count) => {
            console.log(modelName, " token count:" + count)
        },
        // Forcer la mise à jour du modèle à chaque utilisation
        onBeforeAiCall: () => {
            const currentModel = localStorage.getItem('aiModel') || 'anthropic/claude-3-haiku';
            if (window.aiEditor && window.aiEditor.options.ai?.models?.openrouter) {
                window.aiEditor.options.ai.models.openrouter.model = currentModel;
                console.log('🔄 AI Model synced to:', currentModel);
            }
        },


    },
    i18n: {
        zh: {
            // "undo": "Undo (customizable i18n content...)",
            // "redo": "Redo (customizable i18n content!)",
        }
    },
    // onMentionQuery: (query) => {
    //     return new Promise((resolve) => {
    //         setTimeout(() => {
    //             const data = [
    //                 'Michael Yang', 'Jean Zhou', 'Tom Cruise', 'Madonna', 'Jerry Hall', 'Joan Collins', 'Winona Ryder'
    //                 , 'Christina Applegate', 'Alyssa Milano', 'Molly Ringwald', 'Ally Sheedy', 'Debbie Harry', 'Olivia Newton-John'
    //                 , 'Elton John', 'Michael J. Fox', 'Axl Rose', 'Emilio Estevez', 'Ralph Macchio', 'Rob Lowe', 'Jennifer Grey'
    //                 , 'Mickey Rourke', 'John Cusack', 'Matthew Broderick', 'Justine Bateman', 'Lisa Bonet',
    //             ].filter(item => item.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5)
    //             resolve(data)
    //         }, 200)
    //     })
    // }
    onMentionQuery: (query) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = [
                    {
                        id: 1,
                        label: 'Michael Yang'
                    },
                    {
                        id: 2,
                        label: 'Jean Zhou'
                    },
                    {
                        id: 3,
                        label: 'Tom Cruise'
                    },
                    {
                        id: 4,
                        label: 'Madonna'
                    },
                    {
                        id: 5,
                        label: 'Jerry Hall'
                    }
                ].filter(item => item.label.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5)
                resolve(data)
            }, 200)
        })
    }
})

// Gérer le changement de modèle AI - Attendre que l'éditeur soit créé
function setupAiModelSelector() {
    const aiModelSelect = document.getElementById('aiModelSelect') as HTMLSelectElement;
    if (!aiModelSelect) {
        console.warn('⚠️ AI Model selector not found in DOM');
        return;
    }

    console.log('🎛️ AI Model selector initialized');

    // Récupérer le modèle sauvegardé ou utiliser le modèle par défaut
    const savedModel = localStorage.getItem('aiModel') || 'anthropic/claude-3-haiku';
    aiModelSelect.value = savedModel;
    console.log('📋 Current saved model:', savedModel);

    // Mettre à jour le modèle dans la configuration OpenRouter
    const updateAiModel = (model: string) => {
        console.log('🔄 Updating AI model to:', model);

        if (!window.aiEditor) {
            console.warn('⚠️ AiEditor instance not ready yet');
            return;
        }

        const openrouterConfig = window.aiEditor.options.ai?.models?.openrouter;
        if (!openrouterConfig) {
            console.error('❌ OpenRouter configuration not found');
            console.log('Available AI config:', window.aiEditor.options.ai);
            return;
        }

        console.log('⚙️ Current OpenRouter config:', openrouterConfig);

        // Mettre à jour le modèle dans la configuration globale
        openrouterConfig.model = model;
        localStorage.setItem('aiModel', model);

        console.log('✅ Global config updated to model:', model);

        // Mettre à jour directement dans l'instance AiModel existante
        try {
            const aiModel = AiModelManager.get('openrouter');
            console.log('🔍 AI Model instance found:', !!aiModel);
            if (aiModel) {
                console.log('📊 AI Model config before update:', aiModel.aiModelConfig);
                if (aiModel.aiModelConfig) {
                    // Mettre à jour le modèle dans la configuration de l'instance
                    (aiModel.aiModelConfig as any).model = model;
                    console.log('✅ AI Model updated to:', model);
                    console.log('   - Global config updated');
                    console.log('   - Instance config updated');
                    console.log('📊 AI Model config after update:', aiModel.aiModelConfig);
                } else {
                    console.warn('⚠️ AI Model config not found in instance');
                }
            } else {
                console.warn('⚠️ AI Model instance not found, updating global config only');
                console.log('Available models in AiModelManager:', AiModelManager.getAllModels?.() || 'N/A');
            }
        } catch (error) {
            console.error('❌ Error updating AI model:', error);
        }
    };

    // Initialiser avec le modèle sauvegardé - réessayer plusieurs fois si nécessaire
    let retries = 0;
    const maxRetries = 10;
    const initModel = () => {
        if (window.aiEditor && window.aiEditor.options.ai?.models?.openrouter) {
            console.log('🚀 Initializing AI model...');
            updateAiModel(savedModel);
        } else if (retries < maxRetries) {
            retries++;
            console.log(`⏳ Waiting for AiEditor (${retries}/${maxRetries})...`);
            setTimeout(initModel, 200);
        } else {
            console.error('❌ Failed to initialize AI model after multiple retries');
            console.log('AiEditor available:', !!window.aiEditor);
            console.log('AI options:', window.aiEditor?.options?.ai);
        }
    };
    initModel();

    // Écouter les changements
    aiModelSelect.addEventListener('change', (e) => {
        const selectedModel = (e.target as HTMLSelectElement).value;
        console.log('🎯 AI Model changed via selector to:', selectedModel);
        updateAiModel(selectedModel);
    });
}

// Attendre que le DOM soit chargé et que l'éditeur soit créé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(setupAiModelSelector, 300);
    });
} else {
    setTimeout(setupAiModelSelector, 300);
}

