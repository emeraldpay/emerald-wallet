import Immutable from 'immutable';
import accountReducers from './accountReducers';
import ActionTypes from './actionTypes';

describe('accountReducers', () => {
    it('should add only non existed account', () => {
        let state = accountReducers(null, {});
        expect(state.get('accounts')).toEqual(Immutable.List());
        state = accountReducers(state, {
            type: ActionTypes.ADD_ACCOUNT,
            accountId: 'id1',
            name: 'name1',
            description: 'desc1',
        });
        console.log(state.get('accounts').last());
        expect(state.get('accounts').size).toEqual(1);
        expect(state.get('accounts').last().get('id')).toEqual('id1');
        expect(state.get('accounts').last().get('name')).toEqual('name1');

        // add again
        state = accountReducers(state, {
            type: ActionTypes.ADD_ACCOUNT,
            accountId: 'id1',
            name: 'name1',
            description: 'desc1',
        });
        expect(state.get('accounts').size).toEqual(1);
    });

    it('should update zero token balance', () => {
        // prepare
        let state = accountReducers(null, {});
        state = accountReducers(state, {
            type: ActionTypes.ADD_ACCOUNT,
            accountId: 'id1',
            name: 'name1',
            description: 'desc1',
        });

        // do
        state = accountReducers(state, {
            type: ActionTypes.SET_TOKEN_BALANCE,
            accountId: 'id1',
            token: {
                address: '0x2',
                decimals: '0x2',
            },
            value: '0x',
        });
    });
});
