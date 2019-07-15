import {blockchainByName} from '@emeraldwallet/core';
import {addresses} from '..';

export const balanceWei = (state, chain, address, token) => {
  const blockchain = blockchainByName(chain);
  if (token.toLowerCase() === blockchain.params.coinTicker.toLowerCase()) {
    const selectedAccount = addresses.selectors.find(state, address, chain);
    return selectedAccount.get('balance');
  }
  throw new Error(`Unsupported token: ${token}`);
};
