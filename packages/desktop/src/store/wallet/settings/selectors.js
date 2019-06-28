import { Blockchains } from '@emeraldwallet/core';

export const fiatCurrency = (state) => state.wallet.settings.get('localeCurrency');
export const fiatRate = (chain, state) => state.wallet.settings.getIn(['rates', chain.toUpperCase()]);

export const currentChains = (state) => state.wallet.settings.getIn(['mode', 'chains'])
  .toJS()
  .map((chain) => Blockchains[chain.toLowerCase()]);
