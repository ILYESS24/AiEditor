import {defineConfig} from 'vite'
import {resolve} from 'path';
import dts from 'vite-plugin-dts'

export default defineConfig({
    define: {'process.env': {}},
    build: {
        minify: "esbuild",
        lib: {
            entry: resolve(__dirname, './src/index.ts'),
            name: 'AiEditor',
            fileName: (format) => {
                if (format === 'umd') {
                    return 'index.umd.js';
                } else if (format === 'cjs') {
                    return 'index.cjs';
                } else {
                    return 'index.js'; // esm
                }
            },
            // fileName: `index`,
            formats: ['es', 'cjs', 'umd']
        },
    },
    plugins: [dts({rollupTypes: true}),
        // legacy({
        //     targets: ['defaults', 'not IE 11','chrome 52'],
        // }),
    ],
})
