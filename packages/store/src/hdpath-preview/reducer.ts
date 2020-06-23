import {
  ActionTypes,
  IAddressState, IClean, IDisplayAccount,
  IHDPreviewAction,
  IHDPreviewState,
  ISetAddress, ISetBalance,
} from "./types";
import {Blockchains, Logger} from "@emeraldwallet/core";
import {mergeAddress} from "./reducerUtil";

const log = Logger.forCategory('store.hdpathPreview');

export const INITIAL_STATE: IHDPreviewState = {
  accounts: [],
  display: {
    account: 0
  }
};

function onSetAddresses(state: IHDPreviewState, action: ISetAddress): IHDPreviewState {
  let newState = state;
  Object.entries(action.addresses).forEach(([hdpath, address]) => {
    Blockchains[action.blockchain].getAssets()
      .forEach((asset) => {
        const update: IAddressState = {
          address, asset, hdpath,
          blockchain: action.blockchain,
          seed: action.seed
        };
        try {
          newState = mergeAddress(newState, update)
        } catch (e) {
          log.warn("Failed to set new address. " + e.message);
        }
      })
  });
  return newState;
}

function onSetBalance(state: IHDPreviewState, action: ISetBalance): IHDPreviewState {
  const update: Partial<IAddressState> = {
    asset: action.asset,
    blockchain: action.blockchain,
    address: action.address,
    balance: action.balance
  }
  try {
    return mergeAddress(state, update);
  } catch (e) {
    log.warn("Trying to set balance for unknown address. " + e.message)
  }
  return state;
}

function onClean(state: IHDPreviewState, action: IClean): IHDPreviewState {
  return INITIAL_STATE;
}

function onDisplayAccount(state: IHDPreviewState, action: IDisplayAccount): IHDPreviewState {
  return {...state, display: {account: action.account}};
}

export function reducer(
  state: IHDPreviewState = INITIAL_STATE,
  action: IHDPreviewAction
): IHDPreviewState {
  switch (action.type) {
    case ActionTypes.SET_ADDRESS:
      return onSetAddresses(state, action);
    case ActionTypes.SET_BALANCE:
      return onSetBalance(state, action);
    case ActionTypes.CLEAN:
      return onClean(state, action);
    case ActionTypes.DISPLAY_ACCOUNT:
      return onDisplayAccount(state, action);
    default:
      return state;
  }
}
