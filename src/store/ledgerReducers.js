import Immutable from 'immutable';

const initialState = Immutable.fromJS({
    hd: {
        base: "44'/61'/0'/0'",
        offset: 0
    },
    addresses: []
});

const addr = Immutable.fromJS({
    hdpath: null,
    address: null,
    value: null
});

function updateHd(state, hd, f) {
    return state.update('addresses', (list) => {
        const pos = list.findKey((a) => a.get('hdpath') === hd);
        if (pos >= 0) {
            return list.update(pos, f);
        }
        return list;
    })
}

function onGetAddress(state, action) {
    if (action.type === 'LEDGER/ADDR') {
        return updateHd(state, action.hdpath, (addr) => addr.set('address', action.addr))
    }
    return state
}

function onSetPath(state, action) {
    if (action.type === 'LEDGER/SET_LIST_HDPATH') {
        return state.update('addresses', (list) =>
            list.set(action.index, addr.set('hdpath', action.hdpath))
        )
    }
    return state
}

function onSetHd(state, action) {
    if (action.type === 'LEDGER/SET_BASEHD') {
        return state.setIn(['hd', 'base'], action.value)
    }
    return state
}
function onSetOffset(state, action) {
    if (action.type === 'LEDGER/SET_HDOFFSET') {
        return state.setIn(['hd', 'offset'], action.value)
    }
    return state
}

export default function ledgerReducers(state, action) {
    state = state || initialState;
    state = onGetAddress(state, action);
    state = onSetPath(state, action);
    state = onSetOffset(state, action);
    state = onSetHd(state, action);
    return state
}