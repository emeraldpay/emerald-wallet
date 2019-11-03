import { BlockchainCode } from '@emeraldwallet/core';
import { LedgerApi } from '@emeraldwallet/ledger';
import { remote } from 'electron';
import uuid = require('uuid');
import { Dispatched, GetState } from '../types';
import {
  ActionTypes,
  Address,
  AddressBalance,
  AddressSelected,
  AddressTxCount,
  Connected,
  SetBaseHD,
  SetHDOffset, SetListHDPath, Watch
} from './types';

export function setWatch (value: boolean): Watch {
  return {
    type: ActionTypes.WATCH,
    value
  };
}

export function setConnected (value: boolean): Dispatched<Connected | Dispatched<any>> {
  return (dispatch, getState) => {
    if (getState().ledger.get('connected') !== value) {
      dispatch({ type: ActionTypes.CONNECTED, value });
      if (value) {
        dispatch(getAddresses());
      }
    }
  };
}

export function getAddresses (offset: number = 0, count: number = 5)
  : Dispatched<SetHDOffset | AddressSelected | SetListHDPath | Dispatched<any>> {
  return (dispatch, getState) => {
    // let offset = getState().ledger.getIn(['hd', 'offset']);
    const hdbase = getState().ledger.getIn(['hd', 'base']);

    dispatch({
      type: ActionTypes.SET_HDOFFSET,
      value: offset
    });

    dispatch(selectAddr(undefined));

    console.info('Load addresses', hdbase, count);

    for (let i = 0; i < count; i++) {
      const hdpath = [hdbase, i + offset].join('/');
      dispatch(start(i, hdpath));
      dispatch(getAddress(hdpath));
    }
  };
}

function start (index: number, hdpath: string): SetListHDPath {
  return {
    type: ActionTypes.SET_LIST_HDPATH,
    index,
    hdpath
  };
}

export function selectAddr (addr?: string): AddressSelected {
  return {
    type: ActionTypes.ADDR_SELECTED,
    value: addr
  };
}

export function checkConnected (): Dispatched<Connected> {
  return (dispatch, getState) => {
    const ledgerApi: LedgerApi = remote.getGlobal('ledger');
    if (ledgerApi.isConnected()) {
      dispatch(setConnected(true));
    } else {
      console.debug('error connecting. Device is locked or not plugged in.');
      return dispatch(setConnected(false));
    }
  };
}

export function watchConnection (): Dispatched<Connected> {
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

// function loadInfo(chain: BlockchainCode, hdpath: string, addr: string): Dispatched<AddressBalance | AddressTxCount> {
//   return (dispatch, getState, api) => {
//     const ethApi = api.chain(chain).eth;
//     return ethApi.getBalance(addr)
//       .then((balance: BigNumber) => {
//         dispatch({ type: ActionTypes.ADDR_BALANCE, hdpath, value: new Wei(balance)});
//         return ethApi.getTransactionCount(addr)
//           .then((count) => dispatch({
//             type: ActionTypes.ADDR_TXCOUNT,
//             hdpath,
//             value: count
//           }))
//           .catch(screenActions.dispatchRpcError(dispatch));
//       })
//       .catch(screenActions.dispatchRpcError(dispatch));
//   };
// }

export function getAddress (hdpath: string): Dispatched<Address> {
  return (dispatch) => {
    const ledgerApi: LedgerApi = remote.getGlobal('ledger');
    ledgerApi.getAddress(hdpath)
      .then((addr) => {
        dispatch({
          type: ActionTypes.ADDR,
          hdpath,
          addr
        });
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

function createAccountData (address: string, hdpath: string): any {
  return {
    version: 3,
    id: uuid(),
    name: `Ledger ${hdpath}`,
    address: address.substring(2),
    crypto: {
      cipher: 'hardware',
      hardware: 'ledger-nano-s:v1',
      hd_path: hdpath
    }
  };
}

export function importSelected (blockchain: BlockchainCode): Dispatched<AddressSelected> {
  return (dispatch, getState, api) => {
    const { ledger } = getState();
    const selected = ledger.get('selectedAddr').toLowerCase();
    const addresses = ledger.get('addresses');

    const account = addresses.find((a: any) => a.get('address').toLowerCase() === selected);
    const address = account.get('address').toLowerCase();
    const hdpath = account.get('hdpath');

    const data = createAccountData(address, hdpath);

    console.info('Import Ledger address', data);

    return api.emerald.importAccount(data, blockchain).then(() => {
      // clean selected address
      dispatch(selectAddr(undefined));
      return address;
    });
  };
}
