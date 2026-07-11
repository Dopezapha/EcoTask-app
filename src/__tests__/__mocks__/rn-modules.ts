jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
}));

jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
}));

jest.mock('react-native-mmkv', () => {
  const store: Record<string, string> = {};
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: (key: string) => store[key] ?? null,
      set: (key: string, value: string) => {
        store[key] = value;
      },
      delete: (key: string) => {
        delete store[key];
      },
    })),
  };
});

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {
    STELLAR_NETWORK: 'testnet',
    BACKEND_URL: 'http://localhost:3000',
    ECO_TOKEN_ASSET_CODE: 'ECO',
    ECO_TOKEN_ISSUER: 'TESTISSUER',
  },
}));
