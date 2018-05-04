export const Networks = [
  {
    geth: {
      type: 'local',
      url: 'http://127.0.0.1:8545',
    },
    chain: {
      id: 61,
      name: 'mainnet',
    },
    title: 'Mainnet',
    id: 'local/mainnet',
  },
  {
    geth: {
      type: 'remote',
      url: 'https://web3.gastracker.io',
    },
    chain: {
      id: 61,
      name: 'mainnet',
    },
    title: 'Mainnet (gastracker.io)',
    id: 'gastracker/mainnet',
  },
  {
    geth: {
      type: 'remote',
      url: 'https://mew.epool.io/',
    },
    chain: {
      id: 61,
      name: 'mainnet',
    },
    title: 'Mainnet (epool.io)',
    id: 'epool/mainnet',
  },
  {
    geth: {
      type: 'local',
      url: 'http://127.0.0.1:8545',
    },
    chain: {
      id: 62,
      name: 'morden',
    },
    title: 'Morden Testnet',
    id: 'local/morden',
  },
  {
    geth: {
      type: 'remote',
      url: 'https://web3.gastracker.io/morden',
    },
    chain: {
      id: 62,
      name: 'morden',
    },
    title: 'Morden (gastracker.io)',
    id: 'remote/morden',
  },
];


export function findNetwork(gethUrl, chainId) {
  return Networks.find((n) => {
    return (n.chain.id === chainId) && (n.geth.url === gethUrl);
  });
}
