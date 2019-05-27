import {EthereumBlockchain, EthereumClassicBlockchain} from '@emeraldwallet/core';

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
    id: 'remote/xsm',
    coin: 'XSM',
    blockchain: new EthereumBlockchain(),
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
    id: 'remote/xsm',
    coin: 'XSM',
    blockchain: new EthereumBlockchain(),
  }
];


export function findNetwork(gethUrl, chainId) {
  return Networks.find((n) => {
    return (n.chain.id === chainId) && (n.geth.url === gethUrl);
  });
}
