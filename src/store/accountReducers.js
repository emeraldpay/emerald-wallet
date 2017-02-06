import Immutable from 'immutable'

export const initial = Immutable.fromJS({
    accounts: [],
    loading: false
});

function onLoading(state, action) {
    switch (action.type) {
        case 'ACCOUNT/LOADING':
            return state
                .set('loading', true);
        default:
            return state
    }

}

function onSetAccountsList(state, action) {
    switch (action.type) {
        case 'ACCOUNT/SET_LIST':
            return state
                .set('accounts', Immutable.fromJS(action.accounts))
                .set('loading', false);
        default:
            return state
    }
}

export const accountsReducers = function(state, action) {
    state = state || initial;
    state = onLoading(state, action);
    state = onSetAccountsList(state, action);
    return state;
};