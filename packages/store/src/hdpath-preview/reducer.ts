import { Blockchains, Logger, isBitcoin } from '@emeraldwallet/core';
import {
  ActionTypes,
  Entry,
  IAddressState,
  IDisplayAccount,
  IHDPreviewAction,
  IHDPreviewState,
  IInit,
  ISetAddress,
  ISetBalance,
} from './types';
import { mergeAddress } from './utils';

const log = Logger.forCategory('Store::HDPathPreview');

export const INITIAL_STATE: IHDPreviewState = {
  accounts: [],
  active: false,
  display: {
    account: 0,
    entries: [],
    blockchains: [],
  },
};

function onSetAddresses(state: IHDPreviewState, action: ISetAddress): IHDPreviewState {
  let merged = { ...state };

  Object.entries(action.addresses).forEach(([hdpath, address]) => {
    action.assets.forEach((asset) => {
      try {
        merged = mergeAddress(merged, {
          address,
          asset,
          hdpath,
          blockchain: action.blockchain,
          seed: action.seed,
        });
      } catch (exception) {
        if (exception instanceof Error) {
          log.warn('Failed to set new address:', exception.message);
        }
      }
    });
  });

  return merged;
}

function onSetBalance(state: IHDPreviewState, action: ISetBalance): IHDPreviewState {
  const update: Partial<IAddressState> = {
    asset: action.asset,
    blockchain: action.blockchain,
    address: action.address,
    balance: action.balance,
  };

  try {
    return mergeAddress(state, update);
  } catch (exception) {
    if (exception instanceof Error) {
      log.warn('Trying to set balance for unknown address. ' + exception.message);
    }
  }

  return state;
}

function onClean(): IHDPreviewState {
  return INITIAL_STATE;
}

function onInit(state: IHDPreviewState, action: IInit): IHDPreviewState {
  return {
    ...state,
    display: {
      ...state.display,
      blockchains: action.blockchains,
      seed: action.seed,
    },
    active: true,
  };
}

function onDisplayAccount(state: IHDPreviewState, action: IDisplayAccount): IHDPreviewState {
  const { account, indexes } = action;

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

export function reducer(state: IHDPreviewState = INITIAL_STATE, action: IHDPreviewAction): IHDPreviewState {
  switch (action.type) {
    case ActionTypes.SET_ADDRESS:
      return onSetAddresses(state, action);
    case ActionTypes.SET_BALANCE:
      return onSetBalance(state, action);
    case ActionTypes.CLEAN:
      return onClean();
    case ActionTypes.INIT:
      return onInit(state, action);
    case ActionTypes.DISPLAY_ACCOUNT:
      return onDisplayAccount(state, action);
    default:
      return state;
  }
}
