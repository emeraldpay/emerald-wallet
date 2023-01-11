import { BlockchainCode, Blockchains, CurrencyCode } from '@emeraldwallet/core';
import { createSelector } from 'reselect';
import { Mode } from './types';
import { IState } from '../types';

export const fiatCurrency = (state: IState): CurrencyCode => state.settings.localeCurrency;

export const fiatRate = (state: IState, token: string): number | undefined => {
  const { rates } = state.settings;

  if (rates == null) {
    return undefined;
  }

  let code = token.toUpperCase();

  if (code === 'TBTC') {
    code = 'TESTBTC';
  }

  const rate = rates[code];

  if (rate == null) {
    return undefined;
  }

  return parseFloat(rate);
};

export const getChains = (state: IState): BlockchainCode[] => state.settings.mode.chains;
export const getMode = (state: IState): Mode => state.settings.mode;

export const currentChains = createSelector([getChains], (chains) =>
  chains.map((chain) => Blockchains[chain.toLowerCase()]),
);
