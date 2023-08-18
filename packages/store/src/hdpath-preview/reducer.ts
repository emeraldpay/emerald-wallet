import { Blockchains, Logger, isBitcoin } from '@emeraldwallet/core';
import {
  ActionTypes,
  DisplayAccountAction,
  Entry,
  HDPreviewActions,
  HDPreviewState,
  InitAccountAction,
  SetAddressesAction,
} from './types';
import { mergeAddress } from './utils';

const log = Logger.forCategory('Store::HDPathPreview');

export const INITIAL_STATE: HDPreviewState = {
  accounts: [],
  active: false,
  display: {
    account: 0,
    entries: [],
    blockchains: [],
  },
};

function onCleanAccount(): HDPreviewState {
  return INITIAL_STATE;
}

function onDisplayAccount(
  state: HDPreviewState,
  { payload: { account, indexes } }: DisplayAccountAction,
): HDPreviewState {
  const entries: Entry[] = state.display.blockchains.map((blockchain) => {
    const blockchainDetails = Blockchains[blockchain.toLowerCase()];

    let hdPath = blockchainDetails.params.hdPath.forAccount(account).forIndex(indexes?.[blockchain] ?? 0);

    if (isBitcoin(blockchain)) {
      hdPath = hdPath.asAccount();
    }

    return {
      blockchain,
      hdpath: hdPath.toString(),
    };
  });

  return { ...state, display: { ...state.display, account, entries }, active: true };
}

function onInitAccount(state: HDPreviewState, { payload: { blockchains, seed } }: InitAccountAction): HDPreviewState {
  return {
    ...state,
    active: true,
    display: {
      ...state.display,
      blockchains,
      seed,
    },
  };
}

function onSetAddresses(
  state: HDPreviewState,
  { payload: { addresses, assets, balances, blockchain, seed } }: SetAddressesAction,
): HDPreviewState {
  let merged = { ...state };

  Object.entries(addresses).forEach(([hdpath, address]) => {
    const { [address]: balance } = balances;

    assets.forEach((asset) => {
      try {
        merged = mergeAddress(merged, { address, asset, balance, hdpath, blockchain, seed });
      } catch (exception) {
        if (exception instanceof Error) {
          log.warn('Failed to set new address', exception);
        }
      }
    });
  });

  return merged;
}

export function reducer(state: HDPreviewState = INITIAL_STATE, action: HDPreviewActions): HDPreviewState {
  switch (action.type) {
    case ActionTypes.CLEAN_ACCOUNT:
      return onCleanAccount();
    case ActionTypes.DISPLAY_ACCOUNT:
      return onDisplayAccount(state, action);
    case ActionTypes.INIT_ACCOUNT:
      return onInitAccount(state, action);
    case ActionTypes.SET_ADDRESSES:
      return onSetAddresses(state, action);
    default:
      return state;
  }
}
