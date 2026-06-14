import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '~': path.resolve(__dirname, 'src'),
        },
    },
    test: {
        reporter: 'verbose',
        environment: 'jsdom',
        setupFiles: ['./src/testkit/setup.ts'],
        clearMocks: true,
        passWithNoTests: true,
    },
});
