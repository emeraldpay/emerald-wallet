import { Blockchains } from '@emeraldwallet/core';
import { createSelector } from 'reselect';
import { IState } from '../types';

export const fiatCurrency = (state: IState) => state.settings.localeCurrency;

export const fiatRate = (chain: string, state: IState): number | undefined => {
  const rates = state.settings.rates;
  if (!rates) {
    return undefined;
  }
  const strRate = rates[chain.toUpperCase()];
  if (strRate) {
    return parseFloat(strRate);
  }
  return undefined;
};

export const modeChains = (state: IState) => state.settings.mode.chains;
export const mode = (state: IState) => state.settings.mode;

export const currentChains = createSelector(
  [modeChains],
  (chains) => chains.map((chain: any) => Blockchains[chain.toLowerCase()])
);

export const numConfirms = (state: IState): number => state.settings.numConfirmations;
