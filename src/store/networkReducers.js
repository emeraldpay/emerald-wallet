import Immutable from 'immutable';
import { toNumber } from 'lib/convert';
import Networks from 'lib/networks';

const initial = Immutable.fromJS({
    chain: {
        name: 'MAINNET',
        id: 61,
    },
    currentBlock: {
        height: 0,
        hash: null,
    },
    sync: {
        syncing: false,
        startingBlock: null,
        currentBlock: null,
        highestBlock: null,
    },
});

function onSyncing(state, action) {
    if (action.type === 'NETWORK/SYNCING') {
        if (action.syncing) {
            return state.update('sync', (sync) =>
                sync.set('syncing', true)
                    .set('startingBlock', toNumber(action.status.startingBlock))
                    .set('currentBlock', toNumber(action.status.currentBlock))
                    .set('highestBlock', toNumber(action.status.highestBlock))
            ).update('currentBlock', (b) =>
                b.set('height', toNumber(action.status.currentBlock))
                    .set('hash', null)
            );
        }
        return state.setIn(['sync', 'syncing'], false);
    }
    return state;
}

function onHeight(state, action) {
    if (action.type === 'NETWORK/BLOCK') {
        return state.update('currentBlock', (b) =>
            b.set('height', toNumber(action.height))
                .set('hash', null)
        );
    }
    return state;
}

function onSwitchChain(state, action) {
    if (action.type === 'NETWORK/SWITCH_CHAIN') {
        return state.update('chain', (c) =>
            c.set('name', action.network)
                .set('id', Networks.get(action.id))
        );
    }
    return state;
}

export default function networkReducers(state, action) {
    state = state || initial;
    state = onSyncing(state, action);
    state = onHeight(state, action);
    state = onSwitchChain(state, action);
    return state;
}
