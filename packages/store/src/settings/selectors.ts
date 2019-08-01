import { Blockchains } from '@emeraldwallet/core';

export const fiatCurrency = (state: any) => state.wallet.settings.get('localeCurrency');
export const fiatRate = (chain: string, state: any) => state.wallet.settings.getIn(['rates', chain.toUpperCase()]);

export const currentChains = (state: any) => state.wallet.settings.getIn(['mode', 'chains'])
  .toJS()
  .map((chain: any) => Blockchains[chain.toLowerCase()]);
