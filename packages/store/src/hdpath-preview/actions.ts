import { SeedReference } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, Blockchains, TokenRegistry, blockchainCodeToId } from '@emeraldwallet/core';
import { accounts } from '../index';
import { Dispatched } from '../types';
import {
  ActionTypes,
  AddressBalances,
  CleanAccountAction,
  DisplayAccountAction,
  HDPathIndexes,
  InitAccountAction,
  LoadAddressesAction,
  SetAddressesAction,
  moduleName,
} from './types';

export function cleanAccount(): CleanAccountAction {
  return {
    type: ActionTypes.CLEAN_ACCOUNT,
  };
}

export function displayAccount(
  account: number,
  indexes?: HDPathIndexes,
): Dispatched<void, DisplayAccountAction | LoadAddressesAction> {
  return (dispatch, getState, extra) => {
    dispatch({
      type: ActionTypes.DISPLAY_ACCOUNT,
      payload: { account, indexes },
    });

    const state = getState();

    const { seed } = state[moduleName].display ?? {};

    if (seed != null) {
      const isHardware = accounts.selectors.isHardwareSeed(state, seed);

      const { blockchains = [] } = state[moduleName].display ?? {};

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

export function initAccount(blockchains: BlockchainCode[], seed: SeedReference): InitAccountAction {
  return {
    type: ActionTypes.INIT_ACCOUNT,
    payload: { blockchains, seed },
  };
}

export function loadAddresses(
  seed: SeedReference,
  blockchain: BlockchainCode,
  account: number,
  index?: number,
): LoadAddressesAction {
  return {
    type: ActionTypes.LOAD_ADDRESSES,
    payload: { account, blockchain, index, seed },
  };
}

export function setAddresses(
  seed: SeedReference,
  blockchain: BlockchainCode,
  addresses: { [hdPath: string]: string },
): Dispatched<void, SetAddressesAction> {
  return async (dispatch, getState, extra) => {
    const { coin, coinTicker } = Blockchains[blockchain].params;

    const addressList = Object.values(addresses);

    const balanceResults = await Promise.allSettled(
      addressList.map((address) =>
        extra.backendApi.getBalance(address, {
          blockchain: blockchainCodeToId(blockchain),
          code: coin,
        }),
      ),
    );

    const balances = balanceResults.reduce<AddressBalances>((carry, result) => {
      if (result.status === 'rejected') {
        const addressBalances = addressList.reduce<AddressBalances>(
          (addressCarry, address) => ({ ...addressCarry, [address]: null }),
          {},
        );

        return { ...carry, ...addressBalances };
      }

      const addressBalances = addressList.reduce<AddressBalances>((carry, address) => {
        const { balance = null } = result.value.find((item) => item.address === address) ?? {};

        return { ...carry, [address]: balance };
      }, {});

      return { ...carry, ...addressBalances };
    }, {});

    const tokenRegistry = new TokenRegistry(getState().application.tokens);

    const tokens = tokenRegistry.getStablecoins(blockchain).map(({ symbol }) => symbol);

    dispatch({
      type: ActionTypes.SET_ADDRESSES,
      payload: {
        addresses,
        balances,
        blockchain,
        seed,
        assets: [coinTicker, ...tokens],
      },
    });
  };
}
