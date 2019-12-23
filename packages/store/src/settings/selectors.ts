import { Blockchains } from '@emeraldwallet/core';
import {State} from "../types";

export const fiatCurrency = (state: State) => state.wallet.settings.localeCurrency;

export const fiatRate = (chain: string, state: State): number | undefined => {
  let rates = state.wallet.settings.rates;
  if (!rates) {
    return undefined;
  }
  let strRate = rates[chain.toUpperCase()];
  if (strRate) {
    return parseFloat(strRate)
  }
  return undefined;
};

export const currentChains = (state: State) => state.wallet.settings.mode.chains
  .map((chain: any) => Blockchains[chain.toLowerCase()]);

export const numConfirms = (state: State) => state.wallet.settings.numConfirmations;
