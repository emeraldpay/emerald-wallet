import { SeedReference } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, Blockchains, TokenRegistry, blockchainCodeToId } from '@emeraldwallet/core';
import { accounts } from '../index';
import { Dispatched } from '../types';
import {
  ActionTypes,
  HDPathIndexes,
  IClean,
  IDisplayAccount,
  IInit,
  ILoadAddresses,
  ISetAddress,
  ISetBalance,
} from './types';

export function loadAddresses(
  seed: SeedReference,
  blockchain: BlockchainCode,
  account: number,
  index?: number,
): ILoadAddresses {
  return {
    type: ActionTypes.LOAD_ADDRESSES,
    account,
    blockchain,
    index,
    seed,
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
  return (dispatch, getState, extra) => {
    dispatch({
      account,
      indexes,
      type: ActionTypes.DISPLAY_ACCOUNT,
    });

    const state = getState();

    const { seed } = state.hdpathPreview?.display ?? {};

    if (seed != null) {
      const isHardware = accounts.selectors.isHardwareSeed(state, seed);

      const { blockchains = [] } = state.hdpathPreview?.display ?? {};

      blockchains.forEach((blockchain) => {
        if (isHardware) {
          extra.api.vault
            .watch({
              blockchain: blockchainCodeToId(blockchain),
              type: 'available',
            })
            .then((event) =>
              event.devices.forEach((device) => {
                let hwSeed = seed;

                if (device.seed != null) {
                  hwSeed = { type: 'id', value: device.seed };
                }

                dispatch(loadAddresses(hwSeed, blockchain, account, indexes?.[blockchain]));

                if (blockchain === BlockchainCode.ETC && blockchains.includes(BlockchainCode.ETH)) {
                  dispatch(loadAddresses(hwSeed, BlockchainCode.ETH, account, indexes?.[BlockchainCode.ETH]));
                }
              }),
            );
        } else {
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
