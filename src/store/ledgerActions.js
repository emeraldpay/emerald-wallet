import LedgerEth from 'ledgerco/src/ledger-eth';
import LedgerComm from 'ledgerco/src/ledger-comm-u2f';
import log from 'electron-log';
import { rpc } from 'lib/rpc';
import { gotoScreen } from './screenActions';
import uuid from 'uuid/v4';
import Immutable from 'immutable';
import { loadAccountsList } from './accountActions';

function connection() {
    return new Promise((resolve, reject) => {
        if (typeof window.process !== 'undefined') {
            const remote = global.require('electron').remote;
            remote.getGlobal('ledger')
                .connect()
                .then(resolve)
                .catch(reject);
        } else {
            // create U2F connection, which will work _only_ in Chrome + SSL webpage
            LedgerComm.create_async().then((comm) =>
                resolve(new LedgerEth(comm))
            ).catch(reject)
        }
    })
}

function loadInfo(hdpath, addr) {
    return (dispatch) => {
        rpc.call('eth_getBalance', [addr, 'latest']).then((result) => {
            dispatch({
                type: 'LEDGER/ADDR_BALANCE',
                hdpath,
                value: result,
            });
        });
        rpc.call('eth_getTransactionCount', [addr, 'latest']).then((result) => {
            dispatch({
                type: 'LEDGER/ADDR_TXCOUNT',
                hdpath,
                value: result,
            });
        });
    }
}

export function getAddress(hdpath) {
    return (dispatch) => {
        connection()
            .then((conn) => conn.getAddress(hdpath))
            .then((addr) => {
                dispatch({
                    type: 'LEDGER/ADDR',
                    hdpath,
                    addr: addr.address
                });
                dispatch(loadInfo(hdpath, addr.address));
            })
            .catch((err) => log.error("Failed to get Ledger connection", err))
    }
}

function start(index, hdpath) {
    return {
        type: 'LEDGER/SET_LIST_HDPATH',
        index,
        hdpath
    }
}

export function checkConnected() {
    return (dispatch, getState) => {
        let connected = (value) => {
            return () => {
                if (getState().ledger.get('connected') !== value) {
                    dispatch({ type: 'LEDGER/CONNECTED', value});
                    if (value) {
                        dispatch(getAddresses());
                    }
                }
            }
        };

        connection().then((conn) => {
            conn.getStatus()
                .then(connected(true))
                .catch(() => {
                    conn.disconnect();
                    dispatch({ type: 'LEDGER/CONNECTED', value: false});
                });
        }).catch(connected(false))
    }
}

export function watchConnection() {
    return (dispatch, getState) => {
        let start = null;
        let fn = () => {
            dispatch(checkConnected());
            start()
        };
        start = () => {
            let screen = getState().screen.get('screen');
            if (screen === 'add-from-ledger' || screen === 'create-tx') {
                setTimeout(fn, 1000)
            }
        };
        start();
    }
}

export function getAddresses(offset, count) {
    return (dispatch, getState) => {
        count = count || 5;
        offset = offset || 0;
        let hdbase = getState().ledger.getIn(['hd', 'base']);
        // let offset = getState().ledger.getIn(['hd', 'offset']);
        dispatch({
            type: 'LEDGER/SET_HDOFFSET',
            value: offset
        });
        dispatch(selectRows([]));
        log.info("Load addresses", hdbase, count);
        for (let i = 0; i < count; i++) {
            let hdpath = [hdbase, i + offset].join('/');
            dispatch(start(i, hdpath));
            dispatch(getAddress(hdpath));
        }
    }
}

export function selectRows(indexes) {
    return {
        type: 'LEDGER/SELECTED',
        value: indexes
    }
}

export function setBaseHD(hdpath) {
    return {
        type: 'LEDGER/SET_BASEHD',
        value: hdpath
    }
}

export function importSelected() {
    return (dispatch, getState) => {
        let ledger = getState().ledger;
        let selected = ledger.get('selected');
        let addresses = ledger.get('addresses');
        selected.map((index, i) => {
            let addr = addresses.get(index);
            let data = {
                version: 3,
                id: uuid(),
                name: `Ledger ${addr.get('hdpath')}`,
                address: addr.get('address').substring(2),
                crypto: {
                    cipher: "hardware",
                    hardware: "ledger-nano-s:v1",
                    hd_path: addr.get('hdpath')
                }
            };
            let open = i === 0;
            log.info("Import Ledger addr", data);
            rpc.call('emerald_importAccount', [data]).then(() => {
                dispatch(loadAccountsList());
                if (open) {
                    dispatch(gotoScreen('account', Immutable.fromJS({
                        id: addr.get('address'), //FIXME sometimes it's ID sometimes ADDRESS
                        name: data.name,
                    })));
                }
            });
        })
    }
}

