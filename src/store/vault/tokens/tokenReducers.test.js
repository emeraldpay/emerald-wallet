import reducer from './tokenReducers';
import ActionTypes from './actionTypes';

describe('tokenReducer', () => {
    it('ADD_TOKEN should not add same token twice', () => {
        // prepare
        let state = reducer(null, {});

        state = reducer(state, {
            type: ActionTypes.ADD_TOKEN,
            address: '0x1',
            name: 'n1',
        });

        // do
        state = reducer(state, {
            type: ActionTypes.ADD_TOKEN,
            address: '0x1',
            name: 'n1',
        });

        // assert
        expect(state.get('tokens').size).toEqual(1);
    });
});
