// Optional configuration file: jest.config.ts
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',testMatch: [
        "**/__tests__/**/*.test.ts",
        "**/*.test.ts"  // This will find test files in any directory
    ],

    verbose: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'html'],
};

export default config;
