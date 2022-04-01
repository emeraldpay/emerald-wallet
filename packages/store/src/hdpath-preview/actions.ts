import { SeedReference } from '@emeraldpay/emerald-vault-core';
import { AnyCoinCode, BlockchainCode } from '@emeraldwallet/core';
import { isBlockchainOpen } from '../hwkey/selectors';
import { accounts } from '../index';
import { Dispatched } from '../types';
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

export function loadAddresses(
  seed: SeedReference,
  account: number,
  blockchain: BlockchainCode,
  index?: number,
): ILoadAddresses {
  return {
    account,
    blockchain,
    index,
    seed,
    type: ActionTypes.LOAD_ADDRESSES,
  };
}

export function loadBalances(blockchain: BlockchainCode, address: string, assets: AnyCoinCode[]): ILoadBalances {
  return {
    address,
    assets,
    blockchain,
    type: ActionTypes.LOAD_BALANCES,
  };
}

export function setAddresses(
  seed: SeedReference,
  blockchain: BlockchainCode,
  addresses: { [key: string]: string },
): ISetAddress {
  return {
    addresses,
    blockchain,
    seed,
    type: ActionTypes.SET_ADDRESS,
  };
}

export function setBalance(
  blockchain: BlockchainCode,
  address: string,
  asset: AnyCoinCode,
  balance: string,
): ISetBalance {
  return {
    address,
    asset,
    balance,
    blockchain,
    type: ActionTypes.SET_BALANCE,
  };
}

export function displayAccount(account: number, indexes?: HDPathIndexes): Dispatched<IDisplayAccount> {
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
          dispatch(loadAddresses(seed, account, blockchain, indexes?.[blockchain] ?? 0));
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
