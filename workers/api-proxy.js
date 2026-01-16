/**
 * Cloudflare Worker - AI API Proxy
 * Secure proxy for AI API calls - protects API keys from client exposure
 * 
 * Deploy with: npx wrangler deploy workers/api-proxy.js --name aieditor-api
 */

// Rate limiting configuration
const RATE_LIMIT = {
    requests: 50,      // Max requests per window
    windowMs: 60000,   // 1 minute window
};

// In-memory rate limit store (resets on worker restart)
const rateLimitStore = new Map();

/**
 * Check rate limit for an IP
 */
function checkRateLimit(ip) {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT.windowMs;
    
    let record = rateLimitStore.get(ip);
    if (!record) {
        record = { requests: [], blocked: false };
        rateLimitStore.set(ip, record);
    }
    
    // Clean old requests
    record.requests = record.requests.filter(t => t > windowStart);
    
    if (record.requests.length >= RATE_LIMIT.requests) {
        return { allowed: false, remaining: 0, resetIn: Math.ceil((record.requests[0] + RATE_LIMIT.windowMs - now) / 1000) };
    }
    
    record.requests.push(now);
    return { allowed: true, remaining: RATE_LIMIT.requests - record.requests.length, resetIn: 60 };
}

/**
 * CORS headers for responses
 */
function corsHeaders(origin) {
    return {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        'Access-Control-Max-Age': '86400',
    };
}

/**
 * Error response helper
 */
function errorResponse(message, status = 400, origin) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(origin),
        },
    });
}

/**
 * Main request handler
 */
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const origin = request.headers.get('Origin');
        
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: corsHeaders(origin),
            });
        }
        
        // Only allow POST requests
        if (request.method !== 'POST') {
            return errorResponse('Method not allowed', 405, origin);
        }
        
        // Get client IP for rate limiting
        const clientIP = request.headers.get('CF-Connecting-IP') || 
                         request.headers.get('X-Forwarded-For') || 
                         'unknown';
        
        // Check rate limit
        const rateLimit = checkRateLimit(clientIP);
        if (!rateLimit.allowed) {
            return new Response(JSON.stringify({ 
                error: 'Rate limit exceeded',
                resetIn: rateLimit.resetIn 
            }), {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': rateLimit.resetIn.toString(),
                    'Retry-After': rateLimit.resetIn.toString(),
                    ...corsHeaders(origin),
                },
            });
        }
        
        // Route based on path
        const path = url.pathname;
        
        try {
            let response;
            
            if (path === '/v1/openrouter' || path === '/api/openrouter') {
                response = await proxyOpenRouter(request, env);
            } else if (path === '/v1/openai' || path === '/api/openai') {
                response = await proxyOpenAI(request, env);
            } else if (path === '/v1/anthropic' || path === '/api/anthropic') {
                response = await proxyAnthropic(request, env);
            } else if (path === '/v1/deepseek' || path === '/api/deepseek') {
                response = await proxyDeepSeek(request, env);
            } else if (path === '/health') {
                return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
                });
            } else {
                return errorResponse('Unknown endpoint', 404, origin);
            }
            
            // Add CORS and rate limit headers to response
            const newHeaders = new Headers(response.headers);
            Object.entries(corsHeaders(origin)).forEach(([k, v]) => newHeaders.set(k, v));
            newHeaders.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
            
            return new Response(response.body, {
                status: response.status,
                headers: newHeaders,
            });
            
        } catch (error) {
            console.error('Proxy error:', error);
            return errorResponse('Internal server error: ' + error.message, 500, origin);
        }
    },
};

/**
 * Proxy to OpenRouter API
 */
async function proxyOpenRouter(request, env) {
    const body = await request.json();
    const apiKey = env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
        throw new Error('OpenRouter API key not configured');
    }
    
    return fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://aieditor.pages.dev',
            'X-Title': 'AiEditor',
        },
        body: JSON.stringify(body),
    });
}

/**
 * Proxy to OpenAI API
 */
async function proxyOpenAI(request, env) {
    const body = await request.json();
    const apiKey = env.OPENAI_API_KEY;
    
    if (!apiKey) {
        throw new Error('OpenAI API key not configured');
    }
    
    return fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });
}

/**
 * Proxy to Anthropic API
 */
async function proxyAnthropic(request, env) {
    const body = await request.json();
    const apiKey = env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
        throw new Error('Anthropic API key not configured');
    }
    
    return fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
    });
}

/**
 * Proxy to DeepSeek API
 */
async function proxyDeepSeek(request, env) {
    const body = await request.json();
    const apiKey = env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
        throw new Error('DeepSeek API key not configured');
    }
    
    return fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });
}
