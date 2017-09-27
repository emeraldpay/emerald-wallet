import Immutable from 'immutable';
import historyReducers from './historyReducers';
import ActionTypes from './actionTypes';

describe('historyReducer', () => {
    it('should add pending TX or update existent', () => {
        let state = historyReducers(null, {});
        expect(state.get('trackedTransactions')).toEqual(Immutable.List());
        state = historyReducers(state, {
            type: ActionTypes.TRACK_TX,
            tx: {
                hash: 'hash1',
            },
        });
        expect(state.get('trackedTransactions').size).toBe(1);

        state = historyReducers(state, {
            type: ActionTypes.PENDING_TX,
            txList: [
                {hash: 'hash1'},
                {hash: 'hash2'},
            ],
        });
        expect(state.get('trackedTransactions').size).toBe(2);
    });

    it('should update TX data', () => {
        const tx = {
            blockHash: '0xc87e5117923e756e5d262ef230374b73ebe47f232b0f029fa65cf6614d959100',
            blockNumber: '0x17',
            data: '0xfdacd5760000000000000000000000000000000000000000000000000000000000000002',
            from: '0x0178537bb1d7bb412101cdb7389c28fd4cf5ac0a',
            gas: '0x47e7c4',
            gasPrice: '0x174876e800',
            hash: '0x42a46d800b7c5b230ccf5aaa98d1726cad3d621eda0a67fa364322ad3b1d9adc',
            nonce: '0x4',
            to: '0x0d5fa90814e60f2a6cb7bad13d150ba0640d08b9',
            transactionIndex: '0x0',
            value: '0x',
        };
        const action = {
            type: ActionTypes.UPDATE_TX,
            tx,
        };
        // prepare state
        let state = historyReducers(null, {
            type: ActionTypes.TRACK_TX,
            tx: {
                hash: tx.hash,
            },
        });

        // action
        state = historyReducers(state, action);
        const storedTx = state.get('trackedTransactions').last().toJS();
        expect(storedTx.data).toEqual(tx.data);
        expect(storedTx.hash).toEqual(tx.hash);
    });
});
