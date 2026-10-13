// Jest runs jsdom tests in an environment that ships neither TextEncoder nor TextDecoder, and
// react-router needs both when it is imported. Plain CommonJS (like the other files here) so the
// TypeScript build never compiles it. Wired in through `setupFiles` in jest.config.js.
const { TextEncoder, TextDecoder } = require('util');

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder;
}
