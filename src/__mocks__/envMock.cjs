module.exports = {
  env: {
    apiBaseUrl: '/api',
    isDev: true,
    isProd: false,
    appName: 'POS System',
    appVersion: '0.0.0-test',
    buildTime: '1970-01-01T00:00:00.000Z',
    commit: '',
    // Read at use time, like the real `env`, so `vi.stubEnv` in a test takes effect.
    get multiTenant() {
      return process.env.VITE_MULTI_TENANT === 'true';
    },
    get supportEmail() {
      if (!process.env.VITE_SUPPORT_EMAIL) throw new Error('VITE_SUPPORT_EMAIL is not set');
      return process.env.VITE_SUPPORT_EMAIL;
    },
    get supportWhatsapp() {
      if (!process.env.VITE_SUPPORT_WHATSAPP) throw new Error('VITE_SUPPORT_WHATSAPP is not set');
      return process.env.VITE_SUPPORT_WHATSAPP;
    },
    get accountsUrl() {
      return (process.env.VITE_ACCOUNTS_URL || 'https://app.simplebash.com').replace(/\/+$/, '');
    },
  },
};
