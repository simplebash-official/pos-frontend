// Jest transform: ts-jest plus the two source rewrites our Vitest-written tests need.
//
// Tests are written against Vitest (`vi.mock`, `import.meta.env`). Jest only understands `jest.mock`
// and CommonJS, and ts-jest's hoister only moves a call to the top of the file when the receiver is
// literally `jest`. Left alone, `vi.mock(...)` therefore runs after the imports it is meant to
// replace (so the real module is already loaded) and a relative path is resolved from the shim file
// rather than from the test. Rewriting `vi.mock`/`vi.unmock` to `jest.mock`/`jest.unmock` here lets
// ts-jest hoist them and resolve paths from the test file. `import.meta.env` is a syntax error in
// the CommonJS output, so it is mapped to `process.env`, which the shim's `vi.stubEnv` writes to.
//
// Plain CommonJS so the TypeScript build never compiles it. Wired in by `jest.config.js`.
const { TsJestTransformer } = require('ts-jest');

const rewrite = (source) =>
  source
    .replace(/^(\s*)vi\.(mock|unmock)\(/gm, '$1jest.$2(')
    .replace(/import\.meta\.env\b/g, 'process.env');

class ViAwareTransformer extends TsJestTransformer {
  process(source, path, options) {
    return super.process(rewrite(source), path, options);
  }

  // Jest may call either entry point, so both must rewrite.
  async processAsync(source, path, options) {
    return super.processAsync(rewrite(source), path, options);
  }
}

module.exports = {
  createTransformer: (tsJestConfig) => new ViAwareTransformer(tsJestConfig),
};
