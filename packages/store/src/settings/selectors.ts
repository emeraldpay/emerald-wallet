import { Blockchains } from '@emeraldwallet/core';
import { createSelector } from 'reselect';
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

export const modeChains = (state: IState) => state.wallet.settings.mode.chains;

export const currentChains = createSelector(
  [modeChains],
  (chains) => chains.map((chain: any) => Blockchains[chain.toLowerCase()])
);

export const numConfirms = (state: IState) => state.wallet.settings.numConfirmations;
