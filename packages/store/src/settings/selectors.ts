import { Blockchains } from '@emeraldwallet/core';
import { IState } from '../types';

export const fiatCurrency = (state: IState) => state.wallet.settings.localeCurrency;

export const fiatRate = (chain: string, state: IState): number | undefined => {
  const rates = state.wallet.settings.rates;
  if (!rates) {
    return undefined;
  }
  const strRate = rates[chain.toUpperCase()];
  if (strRate) {
    return parseFloat(strRate);
  }
  return undefined;
};

export const currentChains = (state: IState) => state.wallet.settings.mode.chains
  .map((chain: any) => Blockchains[chain.toLowerCase()]);

export const numConfirms = (state: IState) => state.wallet.settings.numConfirmations;
