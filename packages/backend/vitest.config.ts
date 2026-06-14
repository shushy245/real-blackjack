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
        environment: 'node',
        exclude: ['**/node_modules/**', '**/dist/**', '**/*.integration.test.ts'],
        clearMocks: true,
        passWithNoTests: true,
    },
});
