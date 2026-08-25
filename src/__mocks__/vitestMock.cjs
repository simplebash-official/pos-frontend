const vi = {
  fn: (...args) => jest.fn(...args),
  spyOn: (target, prop) => jest.spyOn(target, prop),
  mock: (...args) => jest.mock(...args),
  clearAllMocks: () => jest.clearAllMocks(),
  resetAllMocks: () => jest.resetAllMocks(),
  restoreAllMocks: () => jest.restoreAllMocks(),
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
