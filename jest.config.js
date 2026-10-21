/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    // Vite's `?raw` import: strip the suffix; `rawTransform.cjs` turns the file into a string.
    '^(.+)\\?raw$': '$1',
    // A Vite virtual module; Vitest aliases it to the same stub (see vitest.config.ts).
    '^virtual:pwa-register/react$': '<rootDir>/src/app/components/pwaRegisterStub.ts',
    '^@/config/env$': '<rootDir>/src/__mocks__/envMock.cjs',
    '^pdfjs-dist$': '<rootDir>/src/__mocks__/pdfjsDistMock.cjs',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^vitest$': '<rootDir>/src/__mocks__/vitestMock.cjs',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg|webp|avif)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  // Build-time constants Vite injects through `define` (mirrors vitest.config.ts).
  globals: {
    __APP_VERSION__: '0.0.0-test',
    __BUILD_TIME__: '1970-01-01T00:00:00.000Z',
    __GIT_SHA__: '',
  },
  transform: {
    '\\.(html|conf)$': '<rootDir>/src/__mocks__/rawTransform.cjs',
    '^.+\\.tsx?$': [
      // ts-jest, plus rewriting `vi.mock` -> `jest.mock` so it is hoisted (see the file's header).
      '<rootDir>/src/__mocks__/viTransformer.cjs',
      {
        diagnostics: false,
        isolatedModules: true,
        tsconfig: {
          module: 'commonjs',
          moduleResolution: 'node',
          ignoreDeprecations: '6.0',
          verbatimModuleSyntax: false,
          esModuleInterop: true,
          jsx: 'react-jsx',
        },
      },
    ],
  },
  setupFiles: ['<rootDir>/src/__mocks__/textEncoderPolyfill.cjs'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/graphify-out/'],
};
