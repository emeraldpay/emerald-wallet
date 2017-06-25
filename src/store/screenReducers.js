import Immutable from 'immutable';

const initial = Immutable.fromJS({
    screen: null,
    item: null,
    error: null
});


function onOpen(state, action) {
    if (action.type === 'SCREEN/OPEN') {
        return state
            .set('screen', action.screen)
            .set('item', action.item);
    }
    return state;
}

function onError(state, action) {
    if (action.type === 'SCREEN/ERROR') {
        return state.set('error', action.message)
    }
    return state;
}

export default function screenReducers(state, action) {
    state = state || initial;
    state = onOpen(state, action);
    state = onError(state, action);
    return state;
}
