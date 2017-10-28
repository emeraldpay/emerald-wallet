import Immutable from 'immutable';

const initial = Immutable.fromJS({
    screen: null,
    item: null,
    error: null,
    dialog: null,
    dialogItem: null,
});

function onOpen(state, action) {
    if (action.type === 'SCREEN/OPEN') {
        return state
            .set('screen', action.screen)
            .set('item', action.item)
            .set('dialog', null).set('dialogItem', null);
    }
    return state;
}

function onError(state, action) {
    if (action.type === 'SCREEN/ERROR') {
        return state
            .set('error', action.message)
            .set('dialog', null).set('dialogItem', null);
    }
    return state;
}

function onDialog(state, action) {
    if (action.type === 'SCREEN/DIALOG') {
        return state
            .set('dialog', action.value)
            .set('dialogItem', action.item);
    }
    return state;
}

function onSnackbarOpen(state, action) {
  if (action.type === 'SCREEN/NOTIFICATION_SHOW') {
    return state
      .set('notificationMessage', action.message);
  }
  return state;
};

function onSnackbarClose(state, action) {
  if (action.type === 'SCREEN/NOTIFICATION_CLOSE') {
    return state
      .set('notificationMessage', null);
  }
  return state;
};

export default function screenReducers(state, action) {
    state = state || initial;
    state = onOpen(state, action);
    state = onError(state, action);
    state = onDialog(state, action);
    state = onSnackbarOpen(state, action);
    state = onSnackbarClose(state, action);
    return state;
}
