import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: '.',
    publicDir: 'public',
    build: {
        outDir: 'dist-demo',
        // Use esbuild for minification (built-in, faster)
        minify: 'esbuild',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
            },
            output: {
                // Optimized chunking strategy for better caching and loading
                manualChunks(id) {
                    // TipTap core and extensions
                    if (id.includes('node_modules/@tiptap')) {
                        return 'tiptap';
                    }
                    // Markdown processing
                    if (id.includes('node_modules/markdown-it') || 
                        id.includes('node_modules/turndown') ||
                        id.includes('node_modules/joplin-turndown')) {
                        return 'markdown';
                    }
                    // Highlight.js (syntax highlighting - large)
                    if (id.includes('node_modules/highlight.js') ||
                        id.includes('node_modules/lowlight')) {
                        return 'highlight';
                    }
                    // i18n
                    if (id.includes('node_modules/i18next')) {
                        return 'i18n';
                    }
                    // UI utilities
                    if (id.includes('node_modules/tippy.js') ||
                        id.includes('node_modules/@popperjs')) {
                        return 'ui';
                    }
                    // ProseMirror (TipTap dependency)
                    if (id.includes('node_modules/prosemirror')) {
                        return 'prosemirror';
                    }
                },
                // Optimize chunk file names for caching
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
            },
        },
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 1000,
        // Disable source maps for production
        sourcemap: false,
        // CSS optimization
        cssCodeSplit: true,
        cssMinify: true,
        // Asset inlining threshold (4kb)
        assetsInlineLimit: 4096,
        // Target modern browsers for smaller bundles
        target: 'es2020',
        // Copy public folder
        copyPublicDir: true,
    },
    // Optimize dependencies
    optimizeDeps: {
        include: [
            '@tiptap/core',
            '@tiptap/starter-kit',
            'i18next',
            'tippy.js',
        ],
    },
    // Enable esbuild optimizations
    esbuild: {
        legalComments: 'none',
        treeShaking: true,
        drop: ['console', 'debugger'], // Remove console.log and debugger in production
    },
    server: {
        port: 5173,
        host: true,
    },
});
