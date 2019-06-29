import {Blockchains} from '@emeraldwallet/core';
import {addresses} from '..';
import tokens from 'store/vault/tokens';

export const balanceWei = (state, chain, address, token) => {
  const blockchain = Blockchains[chain];
  if (token === blockchain.params.coinTicker) {
    const selectedAccount = addresses.selectors.find(state, address, chain);
    return selectedAccount.get('balance');
  }

  return tokens.selectors.balanceByTokenSymbol(state.tokens, token, address);
};
