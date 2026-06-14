import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        reporter: 'verbose',
        environment: 'node',
        clearMocks: true,
        passWithNoTests: true,
    },
});
