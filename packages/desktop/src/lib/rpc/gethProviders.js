export const MainnetLocal = {
  geth: {
    type: 'local',
    url: 'http://127.0.0.1:8545',
  },
  chain: {
    id: 20080914,
    name: 'mainnet',
  },
};

export const RemoteMainnet = {
  geth: {
    type: 'remote',
    url: 'https://api.smilo.network',
  },
  chain: {
    id: 20080914,
    name: 'mainnet',
  },
};
