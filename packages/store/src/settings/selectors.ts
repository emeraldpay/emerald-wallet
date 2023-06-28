import { BlockchainCode, Blockchains, CurrencyCode, TokenRegistry } from '@emeraldwallet/core';
import { createSelector } from 'reselect';
import { IState } from '../types';
import { Mode } from './types';

export function fiatCurrency(state: IState): CurrencyCode {
  return state.settings.localeCurrency;
}

export function fiatRate(state: IState, asset: string, blockchain?: BlockchainCode): number | undefined {
  const { rates } = state.settings;

  if (rates == null) {
    return undefined;
  }

  const tokenRegistry = new TokenRegistry(state.application.tokens);

  let key = asset.toUpperCase();

  if (blockchain != null && tokenRegistry.hasSymbol(blockchain, asset)) {
    const token = tokenRegistry.bySymbol(blockchain, asset);

    key = `${blockchain}:${token.address}`;
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
