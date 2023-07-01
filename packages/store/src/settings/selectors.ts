import { BigAmount } from '@emeraldpay/bigamount';
import { BlockchainCode, Blockchains, CurrencyCode, TokenAmount } from '@emeraldwallet/core';
import { createSelector } from 'reselect';
import { IState } from '../types';
import { Mode } from './types';

export function fiatCurrency(state: IState): CurrencyCode {
  return state.settings.localeCurrency;
}

export function fiatRate(state: IState, balance: BigAmount): number | undefined {
  const { rates } = state.settings;

  if (rates == null) {
    return undefined;
  }

  let key = balance.units.top.code.toUpperCase();

  if (TokenAmount.is(balance)) {
    const { address, blockchain } = balance.token;

    key = `${blockchain}:${address}`;
  }

  const rate = rates[key];

  if (rate == null) {
    return undefined;
  }

  return parseFloat(rate);
}

export function getChains(state: IState): BlockchainCode[] {
  return state.settings.mode.chains;
}

export function getMode(state: IState): Mode {
  return state.settings.mode;
}

export const currentChains = createSelector([getChains], (chains) =>
  chains.map((chain) => Blockchains[chain.toLowerCase()]),
);
