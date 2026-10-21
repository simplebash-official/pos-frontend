// Jest mock for pdfjs-dist (ESM package) when running tests under Jest (CommonJS).
module.exports = {
  GlobalWorkerOptions: {
    workerSrc: '',
    workerPort: null,
  },
  getDocument: () => ({
    promise: Promise.resolve({
      numPages: 0,
      getPage: () =>
        Promise.resolve({
          getViewport: () => ({ width: 0, height: 0 }),
          render: () => ({ promise: Promise.resolve(), cancel: () => {} }),
          cleanup: () => {},
        }),
      destroy: () => Promise.resolve(),
    }),
  }),
};
