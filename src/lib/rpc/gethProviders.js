export const MainnetLocal = {
  geth: {
    type: 'local',
    url: 'http://127.0.0.1:8545',
  },
  chain: {
    id: 61,
    name: 'mainnet',
  },
};

export const MainnetEpool = {
  geth: {
    type: 'remote',
    url: 'https://mewapi.epool.io',
  },
  chain: {
    id: 61,
    name: 'mainnet',
  },
};

export const GastrackerMainnet = {
  geth: {
    type: 'remote',
    url: 'https://web3.gastracker.io',
  },
  chain: {
    id: 61,
    name: 'mainnet',
  },
};
