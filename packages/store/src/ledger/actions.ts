import { BlockchainCode, blockchainCodeToId } from '@emeraldwallet/core';
import { LedgerApi } from '@emeraldwallet/ledger';
import { remote } from 'electron';
import { AppThunk, Dispatched, GetState } from '../types';
import {
  ActionTypes,
  AddressSelected,
  IConnectedAction,
  IGetAddressesAction,
  IUpdateAddressAction,
  SetBaseHD,
  SetHDOffset,
  SetListHDPath,
  Watch
} from './types';
import {SeedDescription, SeedReference} from "@emeraldpay/emerald-vault-core";

export function setWatch (value: boolean): Watch {
  return {
    type: ActionTypes.WATCH,
    value
  };
}

export function setConnectedAction (value: boolean): IConnectedAction {
  return {
    type: ActionTypes.CONNECTED,
    value
  };
}

export function setConnected (value: boolean): AppThunk<any> {
  return (dispatch, getState) => {
    if (getState().ledger.get('connected') !== value) {
      dispatch(setConnectedAction(value));
      if (value) {
        dispatch(getAddressesAction() as any);
      }
    }
  };
}

export function setHdOffsetAction (offset: number): SetHDOffset {
  return {
    type: ActionTypes.SET_HDOFFSET,
    value: offset
  };
}

export function getAddressesAction (offset: number = 0, count: number = 5): IGetAddressesAction {
  return {
    type: ActionTypes.GET_ADDRESSES,
    payload: {
      offset,
      count
    }
  };
}

export function start (index: number, hdpath: string): SetListHDPath {
  return {
    type: ActionTypes.SET_LIST_HDPATH,
    index,
    hdpath
  };
}

export function selectAddressAction (addr?: string): AddressSelected {
  return {
    type: ActionTypes.ADDR_SELECTED,
    value: addr
  };
}

export function checkConnected (): AppThunk<IConnectedAction> {
  return (dispatch, getState) => {
    const ledgerApi: LedgerApi = remote.getGlobal('ledger');
    if (ledgerApi.isConnected()) {
      return dispatch(setConnected(true));
    } else {
      console.debug('error connecting. Device is locked or not plugged in.');
      return dispatch(setConnected(false));
    }
  };
}

export function watchConnection (): AppThunk {
  return (dispatch, getState) => {
    const connectionStart = () => {
      const state = getState();
      const watchEnabled = state.ledger.get('watch', false);
      if (watchEnabled) {
        dispatch(checkConnected());
        if (!getState().ledger.get('connected')) {
          setTimeout(connectionStart, 1000);
        }
      }
    };
    connectionStart();
  };
}

function onceConnectionState (getState: GetState, value: boolean): Promise<any> {
  return new Promise((resolve) => {
    const check = () => {
      if (getState().ledger.get('connected') === value) {
        resolve(true);
      } else {
        setTimeout(check, 1000);
      }
    };
    check();
  });
}

type ConnectionHandler = (value: SeedDescription) => void;
const connectionHandlers: ConnectionHandler[] = [];

export function waitConnection(handler: ConnectionHandler): Dispatched<any> {
  connectionHandlers.push(handler);
  return (dispatch, getState, extra) => {
    function refresh() {
      let seed: SeedDescription | undefined;
      extra.api.vault.listSeeds()
        .then((seeds) => {
          seed = seeds.find((seed) => seed.type == "ledger");
          if (typeof seed == "undefined") {
            //when ledger was never used before, but may be connected
            const q: SeedReference = {
              type: "ledger"
            }
            const connected = extra.api.vault.isSeedAvailable(q);
            if (connected) {
              seed = {
                type: "ledger",
                available: true,
                createdAt: new Date()
              }
            }
          }
          console.log("Check ledger", seed);
          if (typeof seed == 'object' && seed.available) {
            let h = connectionHandlers.pop();
            while (h) {
              try {
                h(seed);
              } catch (e) {
                console.warn("Failed to notify connection handler", e)
              }
              h = connectionHandlers.pop();
            }
          } else {
            if (connectionHandlers.length > 0) {
              setTimeout(refresh, 500);
            }
          }
        })
        .catch((err) => console.warn(err));
    }
    refresh();
  }
}

export function updateAddressAction (dpath: string, address: string): IUpdateAddressAction {
  return {
    type: ActionTypes.ADDR,
    hdpath: dpath,
    addr: address
  };
}

export function getAddress (hdpath: string): Dispatched<IUpdateAddressAction> {
  return (dispatch: any) => {
    const ledgerApi: LedgerApi = remote.getGlobal('ledger');
    ledgerApi.getAddress(hdpath)
      .then((addr) => {
        dispatch(updateAddressAction(hdpath, addr));

        // TODO: consider batch request for all addresses
        // return dispatch(loadInfo(chain, hdpath, addr.address));
      })
      .catch((e) => console.error('Ledger access failure', e));
  };
}

export function setBaseHD (hdpath: string): SetBaseHD {
  return {
    type: ActionTypes.SET_BASEHD,
    value: hdpath
  };
}
