import {EthereumBlockchain, EthereumClassicBlockchain, SmiloBlockchain} from '@emeraldwallet/core';

export const Networks = [
  {
    geth: {
      type: 'remote',
      url: 'https://api.smilo.network',
    },
    chain: {
      id: 20080914,
      name: 'xsm',
    },
    title: 'Smilo mainnet',
    id: 'remote/mainnet',
    coin: 'XSM',
    blockchain: new SmiloBlockchain(),
  },
  {
    geth: {
      type: 'remote',
      url: 'https://testnet-wallet.smilo.network/api',
    },
    chain: {
      id: 10,
      name: 'testnet',
    },
    title: 'Smilo Testnet',
    id: 'remote/testnet',
    coin: 'XSM',
    blockchain: new SmiloBlockchain(),
  }
];


export function findNetwork(gethUrl, chainId) {
  return Networks.find((n) => {
    return (n.chain.id === chainId) && (n.geth.url === gethUrl);
  });
}
