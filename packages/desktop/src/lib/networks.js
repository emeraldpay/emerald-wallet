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
    title: 'Ethereum Classic',
    id: 'local/mainnet',
  },
  {
    geth: {
      type: 'remote',
      url: 'https://web3.emeraldwallet.io',
    },
    chain: {
      id: 61,
      name: 'mainnet',
    },
    title: 'Ethereum Classic',
    id: 'gastracker/mainnet',
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
      url: 'https://web3.emeraldwallet.io/morden',
    },
    chain: {
      id: 62,
      name: 'morden',
    },
    title: 'Morden Testnet',
    id: 'remote/morden',
  },
];


export function findNetwork(gethUrl, chainId) {
  return Networks.find((n) => {
    return (n.chain.id === chainId) && (n.geth.url === gethUrl);
  });
}
