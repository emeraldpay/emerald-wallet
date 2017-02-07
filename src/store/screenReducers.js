import Immutable from 'immutable'

const initial = Immutable.fromJS({
    screen: null,
    item: null
});


function onOpen(state, action) {
    if (action.type == 'SCREEN/OPEN') {
        return state
            .set('screen', action.screen)
            .set('item', action.item)
    }
    return state
}

export const screenReducers = function(state, action) {
    state = state || initial;
    state = onOpen(state, action);
    return state;
};