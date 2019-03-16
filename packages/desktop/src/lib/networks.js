export const Networks = [
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
    id: 'gastracker/mainnet',
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
