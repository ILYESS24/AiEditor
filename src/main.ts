import {AiEditor} from "./core/AiEditor.ts";
import {AiModelManager} from "./ai/AiModelManager.ts";

// Extend Window interface for TypeScript
declare global {
    interface Window {
        aiEditor: AiEditor;
    }
}

// Token usage tracking
let totalTokensUsed = 0;

// Production-ready AiEditor configuration
window.aiEditor = new AiEditor({
    element: "#aiEditor",
    placeholder: "Start typing or use AI features...",
    lang: "en",
    contentRetention: true,
    content: 'Welcome to AiEditor - your AI-powered writing assistant. Select text and use the AI bubble menu, or type `/` for AI commands.',

    container: {
        defaultType: "default",
        typeItems: ["default", 'info', 'warning', 'danger']
    },

    image: {
        allowBase64: true,
        defaultSize: 600,
    },

    attachment: {
        uploadUrl: "/v1/upload/file",
    },

    link: {
        autolink: true,
        bubbleMenuItems: ["Edit", "UnLink", "visit"],
    },
    
    textSelectionBubbleMenu: {
        enable: true,
        items: ["ai", "Bold", "Italic", "Underline", "Strike", "Code", "comment"],
    },

    codeBlock: {
        languages: [
            {name: 'Auto', value: 'auto'},
            {name: 'Plain Text', value: 'plaintext', alias: ['text', 'txt']},
            {name: 'JavaScript', value: 'javascript', alias: ['js']},
            {name: 'TypeScript', value: 'typescript', alias: ['ts']},
            {name: 'Python', value: 'python', alias: ['py']},
            {name: 'Java', value: 'java'},
            {name: 'C++', value: 'cpp', alias: ['c++']},
            {name: 'C', value: 'c', alias: ['h']},
            {name: 'C#', value: 'csharp', alias: ['cs']},
            {name: 'Go', value: 'go', alias: ['golang']},
            {name: 'Rust', value: 'rust', alias: ['rs']},
            {name: 'Ruby', value: 'ruby', alias: ['rb']},
            {name: 'PHP', value: 'php'},
            {name: 'Swift', value: 'swift'},
            {name: 'Kotlin', value: 'kotlin', alias: ['kt']},
            {name: 'SQL', value: 'sql'},
            {name: 'HTML', value: 'html'},
            {name: 'CSS', value: 'css'},
            {name: 'SCSS', value: 'scss'},
            {name: 'JSON', value: 'json'},
            {name: 'YAML', value: 'yaml', alias: ['yml']},
            {name: 'Markdown', value: 'markdown', alias: ['md']},
            {name: 'Bash', value: 'bash', alias: ['sh', 'shell']},
            {name: 'PowerShell', value: 'powershell', alias: ['ps1']},
            {name: 'Docker', value: 'dockerfile', alias: ['docker']},
        ]
    },

    emoji: {},

    ai: {
        models: {
            openrouter: {
                apiKey: "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",
                model: localStorage.getItem('aiModel') || "anthropic/claude-3.5-sonnet",
                maxTokens: 4096,
                temperature: 0.7
            }
        },
        bubblePanelEnable: true,
        bubblePanelModel: "openrouter",
        commandsEnable: true,
        
        // AI menus for bubble panel
        bubblePanelMenus: [
            "ai-continuation",
            "ai-optimization", 
            "ai-proofreading",
            "translate",
        ],
        
        // Slash commands
        commands: [
            {
                name: "AI Continue",
                icon: "✨",
                prompt: "Continue writing from where the text ends. Maintain the same tone, style, and context.",
                text: "focusBefore",
            },
            {
                name: "Summarize",
                icon: "📝",
                prompt: "Summarize the following text concisely while keeping the key points:\n\n{content}",
                text: "selected",
            },
            {
                name: "Expand",
                icon: "📖",
                prompt: "Expand on the following text with more details, examples, and explanations:\n\n{content}",
                text: "selected",
            },
            {
                name: "Simplify",
                icon: "🎯",
                prompt: "Simplify the following text to make it easier to understand:\n\n{content}",
                text: "selected",
            },
            {
                name: "Professional",
                icon: "💼",
                prompt: "Rewrite the following text in a more professional and formal tone:\n\n{content}",
                text: "selected",
            },
            {
                name: "Casual",
                icon: "😊",
                prompt: "Rewrite the following text in a more casual and friendly tone:\n\n{content}",
                text: "selected",
            },
            {
                name: "Fix Grammar",
                icon: "✓",
                prompt: "Fix any grammar, spelling, and punctuation errors in the following text. Return only the corrected text:\n\n{content}",
                text: "selected",
            },
            {
                name: "Make Shorter",
                icon: "📉",
                prompt: "Make the following text more concise without losing important information:\n\n{content}",
                text: "selected",
            },
            {
                name: "Make Longer",
                icon: "📈",
                prompt: "Expand the following text with more details while maintaining the original meaning:\n\n{content}",
                text: "selected",
            },
        ],
        
        // Translation configuration
        translate: {
            translateMenuItems: [
                { title: "English", language: "English" },
                { title: "Français", language: "French" },
                { title: "Español", language: "Spanish" },
                { title: "Deutsch", language: "German" },
                { title: "Italiano", language: "Italian" },
                { title: "Português", language: "Portuguese" },
                { title: "中文", language: "Chinese" },
                { title: "日本語", language: "Japanese" },
                { title: "한국어", language: "Korean" },
                { title: "العربية", language: "Arabic" },
                { title: "Русский", language: "Russian" },
            ],
            prompt: (language: string, selectedText: string) => {
                return `Translate the following text to ${language}. Return only the translated text without any explanations:\n\n${selectedText}`;
            },
        },
        
        // Code block AI features
        codeBlock: {
            codeComments: {
                model: "openrouter",
                prompt: "Add helpful comments to explain the following code. Return the code with comments added:\n\n```\n{content}\n```",
            },
            codeExplain: {
                model: "openrouter",
                prompt: "Explain what the following code does in simple terms:\n\n```\n{content}\n```",
            },
        },
        
        // Token consumption tracking
        onTokenConsume: (modelName: string, _modelConfig: any, count: number) => {
            totalTokensUsed += count;
            const tokenCountEl = document.getElementById('tokenCount');
            if (tokenCountEl) {
                tokenCountEl.textContent = totalTokensUsed.toLocaleString();
            }
            // Store in localStorage for persistence
            localStorage.setItem('totalTokensUsed', totalTokensUsed.toString());
        },
    },

    i18n: {
        en: {
            "ai": "AI",
            "ai-continuation": "Continue Writing",
            "ai-optimization": "Improve Writing",
            "ai-proofreading": "Fix Grammar",
            "translate": "Translate",
        },
    },

    onMentionQuery: (query: string) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = [
                    { id: 1, label: 'Michael Yang' },
                    { id: 2, label: 'Jean Zhou' },
                    { id: 3, label: 'Tom Cruise' },
                    { id: 4, label: 'Madonna' },
                    { id: 5, label: 'Jerry Hall' },
                    { id: 6, label: 'AI Assistant' },
                ].filter(item => item.label.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
                resolve(data);
            }, 50);
        });
    },
    
    onCreated: (_editor: AiEditor) => {
        // Load saved token count
        const savedTokens = localStorage.getItem('totalTokensUsed');
        if (savedTokens) {
            totalTokensUsed = parseInt(savedTokens, 10) || 0;
            const tokenCountEl = document.getElementById('tokenCount');
            if (tokenCountEl) {
                tokenCountEl.textContent = totalTokensUsed.toLocaleString();
            }
        }
    },
    
    onChange: (_editor: AiEditor) => {
        // Auto-save is handled by contentRetention
    },
});


/**
 * Update AI Model selection
 */
function updateAiModel(model: string): void {
    localStorage.setItem('aiModel', model);
    
    if (window.aiEditor?.options?.ai?.models?.openrouter) {
        window.aiEditor.options.ai.models.openrouter.model = model;
    }

    try {
        const aiModel = AiModelManager.get('openrouter');
        if (aiModel?.aiModelConfig) {
            (aiModel.aiModelConfig as any).model = model;
        }
    } catch (_e) {
        // Silent fail
    }
}


/**
 * Setup AI Model Selector
 */
function setupAiModelSelector(): void {
    const aiModelSelect = document.getElementById('aiModelSelect') as HTMLSelectElement | null;
    if (!aiModelSelect) return;

    const savedModel = localStorage.getItem('aiModel') || 'anthropic/claude-3.5-sonnet';
    aiModelSelect.value = savedModel;

    // Initialize model
    let retries = 0;
    const maxRetries = 10;
    const initModel = (): void => {
        if (window.aiEditor?.options?.ai?.models?.openrouter) {
            updateAiModel(savedModel);
        } else if (retries < maxRetries) {
            retries++;
            requestAnimationFrame(() => setTimeout(initModel, 100));
        }
    };
    initModel();

    // Listen for model changes
    aiModelSelect.addEventListener('change', (e) => {
        const selectedModel = (e.target as HTMLSelectElement).value;
        updateAiModel(selectedModel);
    });
}

/**
 * Initialize all UI components
 */
function initializeUI(): void {
    setupAiModelSelector();
}

// Optimized initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUI, { once: true });
} else {
    requestAnimationFrame(initializeUI);
}

