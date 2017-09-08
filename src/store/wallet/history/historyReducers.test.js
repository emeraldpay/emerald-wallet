
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
});
