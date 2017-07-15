import LedgerEth from 'ledgerco/src/ledger-eth';
import LedgerComm from 'ledgerco/src/ledger-comm-u2f';
import log from 'electron-log';
import { rpc } from 'lib/rpc';

function connection() {
    return new Promise((resolve, reject) => {
        if (typeof window.process !== 'undefined') {
            log.debug(`Electron: ${window.process.versions.electron}`);
            log.debug('Trying to get Ledger Connection from Electron');
            const remote = global.require('electron').remote;
            remote.getGlobal('ledger')
                .connect()
                .then(resolve)
                .catch(reject);
        } else {
            // create U2F connection, which will work _only_ in Chrome + SSL webpage
            log.info("Use Browser based U2F connection to Ledger");
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
            if (getState().screen.get('screen') === 'add-from-ledger') {
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
        log.info("Load addresses", hdbase, count);
        for (let i = 0; i < count; i++) {
            let hdpath = [hdbase, i + offset].join('/');
            dispatch(start(i, hdpath));
            dispatch(getAddress(hdpath));
        }
    }
}

