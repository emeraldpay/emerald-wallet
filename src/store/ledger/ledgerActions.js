// @flow
import LedgerEth from 'ledgerco/src/ledger-eth';
import LedgerComm from 'ledgerco/src/ledger-comm-u2f';
import uuid from 'uuid/v4';
import launcher from 'store/launcher';
import createLogger from '../../utils/logger';
import ActionTypes from './actionTypes';

const log = createLogger('ledgerActions');

function connection(): Promise<any> {
    return new Promise((resolve, reject) => {
        if (typeof window.process !== 'undefined') {
            const remote = global.require('electron').remote;
            remote.getGlobal('ledger')
                .connect()
                .then(resolve)
                .catch(reject);
        } else {
            // create U2F connection, which will work _only_ in Chrome + SSL webpage
            LedgerComm.create_async()
                .then((comm) => resolve(new LedgerEth(comm)))
                .catch(reject);
        }
    });
}

export function closeConnection(): Promise<any> {
    return new Promise((resolve, reject) => {
        if (typeof window.process !== 'undefined') {
            const remote = global.require('electron').remote;
            remote.getGlobal('ledger')
                .disconnect()
                .then(resolve)
                .catch(reject);
        } else {
            resolve({});
        }
    });
}

function loadInfo(hdpath: string, addr: string) {
    return (dispatch, getState, api) => {
        api.geth.eth.getBalance(addr).then((result) => {
            dispatch({
                type: ActionTypes.ADDR_BALANCE,
                hdpath,
                value: result,
            });
        });
        api.geth.eth.getTransactionCount(addr).then((result) => {
            dispatch({
                type: ActionTypes.ADDR_TXCOUNT,
                hdpath,
                value: result,
            });
        });
    };
}

export function getAddress(hdpath: string) {
    return (dispatch) => {
        connection()
            .then((conn) => conn.getAddress(hdpath))
            .then((addr) => {
                dispatch({
                    type: ActionTypes.ADDR,
                    hdpath,
                    addr: addr.address,
                });
                // TODO: consider batch request for all addresses
                dispatch(loadInfo(hdpath, addr.address));
            })
            .catch((err) => log.error('Failed to get Ledger connection', err));
    };
}

function start(index, hdpath) {
    return {
        type: ActionTypes.SET_LIST_HDPATH,
        index,
        hdpath,
    };
}

export function checkConnected() {
    return (dispatch, getState) => {
        const connected = (value) => {
            return () => {
                if (getState().ledger.get('connected') !== value) {
                    dispatch({ type: ActionTypes.CONNECTED, value});
                    if (value) {
                        dispatch(getAddresses());
                    }
                }
            };
        };

        connection().then((conn) => {
            conn.getStatus()
                .then(connected(true))
                .catch((err) => {
                    conn.disconnect();
                    dispatch({ type: ActionTypes.CONNECTED, value: false});
                });
        }).catch(connected(false));
    };
}

export function watchConnection() {
    return (dispatch, getState) => {
        let start = null;
        const fn = () => {
            const state = getState();
            const dialogDisplayed = state.wallet.screen.get(('dialog')) !== null;
            if (!dialogDisplayed) {
                dispatch(checkConnected());
            }
            start();
        };
        start = () => {
            const state = getState();
            const watchEnabled = state.ledger.get('watch', false);
            if (watchEnabled) {
                setTimeout(fn, 1000);
            }
        };
        start();
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
        const hdbase = getState().ledger.getIn(['hd', 'base']);
        // let offset = getState().ledger.getIn(['hd', 'offset']);
        dispatch({
            type: ActionTypes.SET_HDOFFSET,
            value: offset,
        });
        dispatch(selectAddr(null));
        log.info('Load addresses', hdbase, count);
        for (let i = 0; i < count; i++) {
            const hdpath = [hdbase, i + offset].join('/');
            dispatch(start(i, hdpath));
            dispatch(getAddress(hdpath));
        }
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

