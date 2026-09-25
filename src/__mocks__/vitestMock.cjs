const originalEnv = { ...process.env };
const originalGlobals = {};

const vi = {
  fn: (...args) => jest.fn(...args),
  spyOn: (target, prop) => jest.spyOn(target, prop),
  mock: (...args) => jest.mock(...args),
  mocked: (item) => item,
  clearAllMocks: () => jest.clearAllMocks(),
  resetAllMocks: () => jest.resetAllMocks(),
  restoreAllMocks: () => jest.restoreAllMocks(),
  stubEnv: (key, value) => {
    process.env[key] = value;
  },
  unstubAllEnvs: () => {
    for (const key in process.env) {
      if (!(key in originalEnv)) {
        delete process.env[key];
      }
    }
    Object.assign(process.env, originalEnv);
  },
  stubGlobal: (key, value) => {
    if (!(key in originalGlobals)) {
      originalGlobals[key] = global[key];
    }
    global[key] = value;
  },
  unstubAllGlobals: () => {
    for (const key in originalGlobals) {
      if (originalGlobals[key] === undefined) {
        delete global[key];
      } else {
        global[key] = originalGlobals[key];
      }
    }
  },
  waitFor: async (callback, { timeout = 1000, interval = 20 } = {}) => {
    const start = Date.now();
    let lastError;
    while (Date.now() - start < timeout) {
      try {
        return await callback();
      } catch (err) {
        lastError = err;
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }
    throw lastError;
  },
};

module.exports = {
  describe,
  it,
  test,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  vi,
  default: {
    describe,
    it,
    test,
    expect,
    beforeEach,
    afterEach,
    beforeAll,
    afterAll,
    vi,
  },
};
