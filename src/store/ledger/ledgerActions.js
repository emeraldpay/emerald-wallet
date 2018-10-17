// @flow
import uuid from 'uuid/v4';
import launcher from '../launcher';
import createLogger from '../../utils/logger';
import ActionTypes from './actionTypes';

const log = createLogger('ledgerActions');
function connection(): Promise<any> {
  log.debug('getting a ledger connection');
  const remote = global.require('electron').remote;
  return remote.getGlobal('ledger').connect();
}

export function closeConnection(): Promise<any> {
  log.debug('closing connection to ledger');
  const remote = global.require('electron').remote;
  return remote.getGlobal('ledger').disconnect();
}

function loadInfo(hdpath: string, addr: string) {
  return (dispatch, getState, api) => {
    return api.geth.eth.getBalance(addr).then((balance) => {
      dispatch({ type: ActionTypes.ADDR_BALANCE, hdpath, value: balance });

      return api.geth.eth.getTransactionCount(addr).then((count) => {
        dispatch({ type: ActionTypes.ADDR_TXCOUNT, hdpath, value: count });
      });
    });
  };
}

export function getAddress(hdpath: string) {
  return (dispatch) => {
    return connection()
      .then((ledgerApi) => ledgerApi.getAddress(hdpath))
      .then((addr) => {
        dispatch({
          type: ActionTypes.ADDR,
          hdpath,
          addr: addr.address,
        });
        // TODO: consider batch request for all addresses
        return dispatch(loadInfo(hdpath, addr.address));
      });
  };
}

function start(index, hdpath) {
  return {
    type: ActionTypes.SET_LIST_HDPATH,
    index,
    hdpath,
  };
}

let isWatchingConnection = false;
export function setConnected(value) {
  return (dispatch, getState) => {
    if (value === false) { clearTimeout(isWatchingConnection); }

    const promises = [];
    if (getState().ledger.get('connected') !== value) {
      promises.push(dispatch({ type: ActionTypes.CONNECTED, value}));
      if (value) {
        promises.push(dispatch(getAddresses()));
      }
    }
    return Promise.all(promises);
  };
}

export function checkConnected() {
  return (dispatch, getState) => {
    return connection().then((ledgerApi) => {
      return ledgerApi.getStatus()
        .then(() => ledgerApi.getAddress("m/44'/60'/160720'/0'"))
        .then(() => dispatch(setConnected(true)))
        .catch((err) => {
          log.debug('Cannot get ledger status. Ensure the ledger has the etc app open');
          log.debug(err);
          return dispatch(setConnected(false)).then(() => ledgerApi.disconnect());
        });
    })
      .catch((e) => {
        log.debug('error connecting. Device is locked or not plugged in.');
        log.debug(e);
        return dispatch(setConnected(false));
      });
  };
}

export function watchConnection() {
  return (dispatch, getState) => {
    const connectionStart = () => {
      const state = getState();
      const watchEnabled = state.ledger.get('watch', false);
      if (watchEnabled) {
        return dispatch(checkConnected()).then(() => {
          isWatchingConnection = setTimeout(connectionStart, 3000);
        });
      }
      isWatchingConnection = setTimeout(connectionStart, 3000);
      return Promise.resolve();
    };

    if (isWatchingConnection === false) {
      isWatchingConnection = true;
      connectionStart();
    }
  };
}

export function setWatch(value: boolean) {
  return ({
    type: ActionTypes.WATCH,
    value,
  });
}

export function selectAddr(addr: ?string) {
  return {
    type: ActionTypes.ADDR_SELECTED,
    value: addr,
  };
}

export function getAddresses(offset: number = 0, count: number = 5) {
  return (dispatch, getState) => {
    // let offset = getState().ledger.getIn(['hd', 'offset']);
    const hdbase = getState().ledger.getIn(['hd', 'base']);

    dispatch({
      type: ActionTypes.SET_HDOFFSET,
      value: offset,
    });

    dispatch(selectAddr(null));

    log.info('Load addresses', hdbase, count);

    const promises = [];
    for (let i = 0; i < count; i++) {
      const hdpath = [hdbase, i + offset].join('/');
      dispatch(start(i, hdpath));
      promises.push(dispatch(getAddress(hdpath)));
    }

    return Promise.all(promises);
  };
}

export function setBaseHD(hdpath: string) {
  return {
    type: ActionTypes.SET_BASEHD,
    value: hdpath,
  };
}

function createAccountData(address: string, hdpath: string) {
  return {
    version: 3,
    id: uuid(),
    name: `Ledger ${hdpath}`,
    address: address.substring(2),
    crypto: {
      cipher: 'hardware',
      hardware: 'ledger-nano-s:v1',
      hd_path: hdpath,
    },
  };
}

export function importSelected() {
  return (dispatch, getState, api) => {
    const ledger = getState().ledger;
    const selected = ledger.get('selectedAddr');
    const addresses = ledger.get('addresses');
    const chain = launcher.selectors.getChainName(getState());

    const account = addresses.find((a) => a.get('address') === selected);
    const address = account.get('address');
    const hdpath = account.get('hdpath');

    const data = createAccountData(address, hdpath);

    log.info('Import Ledger address', data);

    return api.emerald.importAccount(data, chain).then(() => {
      // clean selected address
      dispatch(selectAddr(null));
      return address;
    });
  };
}
