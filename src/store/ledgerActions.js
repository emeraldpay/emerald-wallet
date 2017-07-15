import LedgerEth from 'ledgerco/src/ledger-eth';
import LedgerComm from 'ledgerco/src/ledger-comm-u2f';
import log from 'electron-log';

function connection() {
    return new Promise((resolve, reject) => {
        if (typeof window.process !== 'undefined') {
            log.debug(`Electron: ${window.process.versions.electron}`);
            log.debug('Trying to get Ledger Connection from Electron');
            const remote = global.require('electron').remote;
            resolve(remote.getGlobal('ledger'));
        } else {
            // create U2F connection, which will work _only_ in Chrome + SSL webpage
            log.info("Use Browser based U2F connection to Ledger");
            LedgerComm.create_async().then((comm) =>
                resolve(new LedgerEth(comm))
            ).catch(reject)
        }
    })
}

connection().then( (conn) => {
    conn.getStatus().then((status) => log.info("Ledger status", status));
});

export function getAddress(hdpath) {
    return (dispatch) => {
        log.info("Load address", hdpath);
        connection()
            .then((conn) => conn.getAddress(hdpath))
            .then((addr) => {
                dispatch({
                    type: 'LEDGER/ADDR',
                    hdpath,
                    addr: addr.address
                }
            )
        }).catch((err) => log.error("Failed to get Ledger connection", err))
    }
}

function start(index, hdpath) {
    return {
        type: 'LEDGER/SET_LIST_HDPATH',
        index,
        hdpath
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

