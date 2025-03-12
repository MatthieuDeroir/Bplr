module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/types.ts',
        '!src/app.ts',
        '!src/inversify.config.ts'
    ],
    coverageDirectory: 'coverage',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    verbose: true
};