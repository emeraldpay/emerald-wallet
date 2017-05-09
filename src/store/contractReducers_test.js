import Immutable from 'immutable';
import contractReducers from './contractReducers';

describe('contractReducers', () => {
    it('should set contracts as empty list in case action.contracts undefined', () => {
        let state = contractReducers(null, {});
        expect(state.get('contracts')).toEqual(Immutable.List());
        state = contractReducers(state, {
            type: 'CONTRACT/SET_LIST',
        });
        expect(state.get('contracts')).toEqual(Immutable.List());
    });
});
