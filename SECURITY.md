# 🔒 Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please report it by emailing security@aieditor.dev (or opening a private issue).

Do NOT report security vulnerabilities via public GitHub issues.

## Security Best Practices

### For End Users

1. **Protect Your API Keys**
   - Never share your OpenRouter/OpenAI API keys
   - Use keys with spending limits set
   - Rotate keys periodically
   - Monitor usage in your provider dashboard

2. **Browser Security**
   - Use a modern browser with auto-updates enabled
   - Don't use AiEditor on untrusted networks without VPN
   - Clear localStorage when using shared computers

### For Developers/Self-Hosting

1. **API Key Management**
   - NEVER hardcode API keys in source code
   - Use environment variables or secret managers
   - Deploy the included Cloudflare Worker for backend proxy
   - Set up rate limiting to prevent abuse

2. **Deploy the API Proxy**
   ```bash
   cd workers
   npx wrangler secret put OPENROUTER_API_KEY
   npx wrangler deploy
   ```

3. **Add Authentication** (for multi-user apps)
   - Implement user authentication before AI access
   - Use JWT or session-based auth
   - Validate user permissions server-side

4. **Content Security Policy**
   The `_headers` file includes a strict CSP. Customize if needed:
   ```
   Content-Security-Policy: default-src 'self'; ...
   ```

5. **Rate Limiting**
   The API proxy includes rate limiting:
   - 50 requests per minute per IP
   - Customize in `workers/api-proxy.js`

## Security Headers

All deployments include these security headers:

| Header | Value | Purpose |
|--------|-------|---------|
| X-Frame-Options | DENY | Prevent clickjacking |
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-XSS-Protection | 1; mode=block | XSS protection |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer |
| Content-Security-Policy | (comprehensive) | Prevent injection |
| Permissions-Policy | restrictive | Limit browser features |

## Known Security Considerations

### Client-Side API Keys

The current implementation stores API keys in localStorage for personal/demo use. For production multi-user applications:

1. Deploy the API proxy worker
2. Don't expose API keys to the client
3. Implement proper authentication
4. Use server-side API key management

### Content Injection

TipTap sanitizes HTML input, but always validate:
- User-provided content before storage
- Content from external sources
- Markdown conversion output

## Security Checklist

- [x] No hardcoded API keys in source
- [x] API key validation on input
- [x] Rate limiting in API proxy
- [x] Security headers configured
- [x] HTTPS enforced (Cloudflare)
- [x] XSS protection enabled
- [x] Clickjacking prevention
- [x] CSP configured
- [x] Service worker with cache validation
- [ ] User authentication (implement for multi-user)
- [ ] Server-side API proxy (deploy for production)
- [ ] Audit logging (implement as needed)

## Dependency Security

We regularly update dependencies. Run:
```bash
npm audit
npm update
```

## Contact

For security concerns: security@aieditor.dev
