import Immutable from 'immutable'

export const initial = Immutable.fromJS({
    accounts: [],
    loading: false
});

function onSetAccountsList(state, action) {
    switch (action.type) {
        case 'ACCOUNT/SET-LIST':
            return state.set('accounts', Immutable.fromJS(action.account));
        default:
            return state
    }
}

export const accountsReducers = function(state, action) {
    state = state || initial;
    state = onSetAccountsList(state, action);
    return state;
};