import { Blockchains, Logger, isBitcoin } from '@emeraldwallet/core';
import { mergeAddress } from './reducerUtil';
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
  let newState = state;

  Object.entries(action.addresses).forEach(([hdpath, address]) => {
    action.assets.forEach((asset) => {
      const update: IAddressState = {
        address,
        asset,
        hdpath,
        blockchain: action.blockchain,
        seed: action.seed,
      };

      try {
        newState = mergeAddress(newState, update);
      } catch (exception) {
        if (exception instanceof Error) {
          log.warn('Failed to set new address.', exception.message);
        }
      }
    });
  });

  return newState;
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

    let hdpath = blockchainDetails.params.hdPath.forAccount(account).forIndex(indexes?.[blockchain] ?? 0);

    if (isBitcoin(blockchain)) {
      hdpath = hdpath.asAccount();
    }

    return {
      blockchain,
      address: undefined,
      hdpath: hdpath.toString(),
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
