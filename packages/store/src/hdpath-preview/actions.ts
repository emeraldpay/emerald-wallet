import { SeedReference } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, Blockchains, TokenRegistry } from '@emeraldwallet/core';
import {
  ActionTypes,
  HDPathIndexes,
  IClean,
  IDisplayAccount,
  IInit,
  ILoadAddresses,
  ILoadBalances,
  ISetAddress,
  ISetBalance,
} from './types';
import { isBlockchainOpen } from '../hwkey/selectors';
import { accounts } from '../index';
import { Dispatched } from '../types';

export function loadAddresses(
  seed: SeedReference,
  blockchain: BlockchainCode,
  account: number,
  index?: number,
): Dispatched<void, ILoadAddresses> {
  return (dispatch, getState) => {
    const { coinTicker } = Blockchains[blockchain].params;

    const tokenRegistry = new TokenRegistry(getState().application.tokens);

    const tokens = tokenRegistry.getStablecoins(blockchain).map(({ symbol }) => symbol);

    dispatch({
    account,
    blockchain,
    index,
    seed,
    type: ActionTypes.LOAD_ADDRESSES,
      assets: [coinTicker, ...tokens],
    });
  };
}

export function loadBalances(
  seed: SeedReference,
  blockchain: BlockchainCode,
  hdpath: string,
  address: string,
  assets: string[],
): ILoadBalances {
  return {
    address,
    assets,
    blockchain,
    hdpath,
    seed,
    type: ActionTypes.LOAD_BALANCES,
  };
}

export function setAddresses(
  seed: SeedReference,
  blockchain: BlockchainCode,
  addresses: { [key: string]: string },
): Dispatched<void, ISetAddress> {
  return (dispatch, getState) => {
    const { coinTicker } = Blockchains[blockchain].params;

    const tokenRegistry = new TokenRegistry(getState().application.tokens);

    const tokens = tokenRegistry.getStablecoins(blockchain).map(({ symbol }) => symbol);

    dispatch({
      addresses,
      blockchain,
      seed,
      type: ActionTypes.SET_ADDRESS,
      assets: [coinTicker, ...tokens],
    });
  };
}

export function setBalance(
  seed: SeedReference,
  blockchain: BlockchainCode,
  hdpath: string,
  address: string,
  asset: string,
  balance: string,
): ISetBalance {
  return {
    address,
    asset,
    balance,
    blockchain,
    hdpath,
    seed,
    type: ActionTypes.SET_BALANCE,
  };
}

export function displayAccount(
  account: number,
  indexes?: HDPathIndexes,
): Dispatched<void, IDisplayAccount | ILoadAddresses> {
  return (dispatch, getState) => {
    dispatch({
      account,
      indexes,
      type: ActionTypes.DISPLAY_ACCOUNT,
    });

    const state = getState();

    const { seed } = state.hdpathPreview?.display ?? {};

    if (seed != null) {
      const isHardware = accounts.selectors.isHardwareSeed(state, seed);

      state.hdpathPreview?.display.blockchains.forEach((blockchain) => {
        if (!isHardware || isBlockchainOpen(state, blockchain)) {
          dispatch(loadAddresses(seed, blockchain, account, indexes?.[blockchain]));
        }
      });
    }
  };
}

export function clean(): IClean {
  return {
    type: ActionTypes.CLEAN,
  };
}

export function init(blockchains: BlockchainCode[], seed: SeedReference): IInit {
  return {
    blockchains,
    seed,
    type: ActionTypes.INIT,
  };
}
