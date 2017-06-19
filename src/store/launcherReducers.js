import Immutable from 'immutable';

const initial = Immutable.fromJS({
    firstRun: false,
    launcherType: "web",
    chain: {
        type: "local-geth"
        //type: "remote", url: "http://api.gastracker.io/web3"
    },
    message: {
        text: "Starting...",
        level: 2
    },
    status: {
        geth: "not ready",
        connector: "not ready"
    }
});

function onConfig(state, action) {
    if (action.type === 'LAUNCHER/CONFIG') {
        return state
            .set('launcherType', action.launcherType)
            .set('firstRun', action.config.firstRun)
            .set('chain', Immutable.fromJS(action.config.chain))
    }
    return state;
}

function onMessage(state, action) {
    if (action.type === 'LAUNCHER/MESSAGE') {
        return state.update("message", (m) =>
            m.set("text", action.msg).set("level", action.level)
        )
    }
    return state;
}

function onServiceStatus(state, action) {
    if (action.type === 'LAUNCHER/SERVICE_STATUS') {
        return state.setIn(["status", action.service], action.mode);
    }
    return state;
}

export default function launcherReducers(state, action) {
    state = state || initial;
    state = onConfig(state, action);
    state = onMessage(state, action);
    state = onServiceStatus(state, action);
    return state;
}
