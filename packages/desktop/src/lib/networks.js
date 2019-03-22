export const Networks = [
  {
    geth: {
      type: 'remote',
      url: 'https://web3.emeraldwallet.io/eth',
    },
    chain: {
      id: 1,
      name: 'eth',
    },
    title: 'Ethereum',
    id: 'remote/eth',
    coin: 'ETH',
  },
  {
    geth: {
      type: 'remote',
      url: 'https://web3.emeraldwallet.io/etc',
    },
    chain: {
      id: 61,
      name: 'mainnet',
    },
    title: 'Ethereum Classic',
    id: 'remote/etc',
    coin: 'ETC',
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
    coin: 'MORDEN',
  },
];


export function findNetwork(gethUrl, chainId) {
  return Networks.find((n) => {
    return (n.chain.id === chainId) && (n.geth.url === gethUrl);
  });
}
