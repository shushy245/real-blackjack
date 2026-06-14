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
        include: ['**/*.integration.test.ts'],
        testTimeout: 15000,
        fileParallelism: false,
    },
});
