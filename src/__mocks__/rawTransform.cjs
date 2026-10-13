// Jest transform for text files that Vite imports with `?raw` (see `src/__tests__/csp.test.ts`):
// the module is the file's contents as a string, which is what Vite's `?raw` gives. Paired with the
// `\?raw$` entry in `jest.config.js`'s `moduleNameMapper`, which strips the suffix so the real file
// is found. Plain CommonJS so the TypeScript build never compiles it.
module.exports = {
  process: (source) => ({ code: `module.exports = ${JSON.stringify(source)};` }),
};
