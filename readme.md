# 🚀 AiEditor - Production Ready

AI-Powered Rich Text Editor with multi-model support. Built with TipTap, TypeScript, and modern web technologies.

![AiEditor Screenshot](./screenshots/aieditor-complete-deployment.png)

## ✨ Features

### 🤖 AI Integration
- **11 AI Models Supported**: OpenRouter, OpenAI, Claude, Gemini, DeepSeek, Grok, Ollama, and more
- **Streaming Responses**: Real-time AI text generation via SSE
- **AI Commands**: `/` slash commands for quick AI actions
- **Bubble Menu AI**: Select text and use AI features instantly
- **Translation**: 11 languages supported
- **Code Assistance**: AI-powered code comments and explanations

### 📝 Rich Text Editing
- Full TipTap-based editor with all formatting options
- Markdown import/export
- Code blocks with syntax highlighting (25+ languages)
- Tables, images, attachments
- @mentions and emoji support
- Light/Dark theme

### 🔒 Security
- **No hardcoded API keys** - User provides their own keys
- **API Key validation** with OpenRouter
- **Secure localStorage** for settings
- **Rate limiting** in API proxy
- **CSP Headers** configured
- **XSS/Clickjacking protection**

### ⚡ Performance
- **PWA Support** - Works offline, installable
- **Service Worker** - Smart caching strategies
- **Code Splitting** - Optimized bundle chunks (~580KB gzipped)
- **CDN Delivery** - Cloudflare global network
- **HTTPS** - Forced SSL

## 🌐 Live Demo

**Production URL**: https://aieditor.pages.dev

## 📦 Project Structure

```
AiEditor/
├── src/
│   ├── ai/                    # AI integrations
│   │   ├── openrouter/        # OpenRouter API
│   │   ├── openai/            # OpenAI API
│   │   ├── claude/            # Anthropic Claude
│   │   ├── gemini/            # Google Gemini
│   │   ├── deepseek/          # DeepSeek
│   │   ├── grok/              # xAI Grok
│   │   ├── ollama/            # Local Ollama
│   │   └── core/              # Base AI classes
│   ├── core/                  # Editor core
│   ├── components/            # UI components
│   ├── i18n/                  # Translations (11 languages)
│   └── main.ts                # Entry point
├── workers/
│   ├── api-proxy.js           # Cloudflare Worker for API proxy
│   └── wrangler.toml          # Worker configuration
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   ├── _headers               # Cloudflare headers
│   └── _redirects             # SPA routing
├── dist-demo/                 # Production build
└── index.html                 # Main HTML
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build:demo
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server on port 5173 |
| `npm run build` | Build library for npm |
| `npm run build:demo` | Build demo for deployment |
| `npm run preview` | Preview production build |

## 🚀 Deployment

### Deploy to Cloudflare Pages

```bash
# Build the demo
npm run build:demo

# Deploy to Cloudflare
npx wrangler pages deploy dist-demo --project-name=aieditor
```

### Deploy API Proxy (Optional - for backend key management)

```bash
cd workers

# Set your API keys as secrets
npx wrangler secret put OPENROUTER_API_KEY
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put ANTHROPIC_API_KEY

# Deploy the worker
npx wrangler deploy
```

## 🔑 API Configuration

### Using OpenRouter (Recommended)

1. Get an API key from [OpenRouter](https://openrouter.ai/keys)
2. Enter the key in the Settings panel (⚙️ button)
3. Select your preferred AI model
4. Start using AI features!

### Supported Models via OpenRouter

| Provider | Models |
|----------|--------|
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Opus/Sonnet/Haiku |
| **OpenAI** | GPT-4o, GPT-4o-mini, GPT-4 Turbo, GPT-3.5 |
| **Google** | Gemini Pro 1.5, Gemini Flash |
| **Meta** | Llama 3.1 70B/8B |
| **Mistral** | Mistral Large, Mixtral 8x7B |
| **Others** | DeepSeek, Qwen, Command R+ |

## 🔒 Security Best Practices

### For Production Use

1. **Use Backend Proxy**: Deploy the included Cloudflare Worker to proxy API calls
2. **Never Expose Keys**: The client-side API key input is for personal use only
3. **Add Authentication**: For multi-user apps, add user auth before AI access
4. **Monitor Usage**: Use OpenRouter's dashboard to track token usage
5. **Set Limits**: Configure rate limits in the worker

### Security Headers (Configured)

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` (comprehensive)

## 📊 Bundle Analysis

| Chunk | Size | Gzipped | Content |
|-------|------|---------|---------|
| main | 237KB | 73KB | Editor core + AI |
| prosemirror | 249KB | 77KB | Rich text engine |
| tiptap | 147KB | 51KB | Extensions |
| highlight | 926KB | 301KB | Syntax highlighting |
| markdown | 109KB | 52KB | MD processing |
| i18n | 49KB | 15KB | Translations |

**Total**: ~1.7MB → **~580KB gzipped**

## 🌍 Internationalization

Supported languages:
- 🇺🇸 English
- 🇨🇳 Chinese (Simplified)
- 🇯🇵 Japanese
- 🇰🇷 Korean
- 🇩🇪 German
- 🇫🇷 French
- 🇪🇸 Spanish
- 🇵🇹 Portuguese
- 🇮🇩 Indonesian
- 🇻🇳 Vietnamese
- 🇹🇭 Thai

## 📱 PWA Features

- ✅ Installable on desktop and mobile
- ✅ Works offline (cached assets)
- ✅ Automatic updates notification
- ✅ App shortcuts
- ✅ Responsive design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

LGPL License - See [LICENSE](./LICENSE) for details

## 🙏 Credits

- [TipTap](https://tiptap.dev/) - The headless editor framework
- [OpenRouter](https://openrouter.ai/) - AI model aggregator
- [Cloudflare Pages](https://pages.cloudflare.com/) - Hosting
- [Vite](https://vitejs.dev/) - Build tool

---

Made with ❤️ by the AiEditor Team
