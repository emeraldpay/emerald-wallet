import Immutable from 'immutable';

const initial = Immutable.fromJS({
    firstRun: false,
    settingUpdated: false,
    launcherType: 'web',
    terms: 'none',
    chain: {
        rpc: null,
        // rpc: "remote", url: "http://api.gastracker.io/web3"
    },
    message: {
        text: 'Starting...',
        level: 2,
    },
    status: {
        geth: 'not ready',
        connector: 'not ready',
    },
});

// TODO: replace me with FS persistent storage along with user settings, eg
// - window dimensions,
// - rpc/geth/connector prefs
function getStoredFirstRun() {
    if (window.localStorage) {
        const val = window.localStorage.getItem('emerald_firstRun');
        if (typeof val !== 'undefined' && JSON.parse(val) === false) {
            return false;
        }
    }
    return true;
}
function setStoredFirstRun() {
    if (window.localStorage) {
        window.localStorage.setItem('emerald_firstRun', JSON.stringify(false));
    }
}

function onConfig(state, action) {
    if (action.type === 'LAUNCHER/CONFIG') {
        setTimeout(setStoredFirstRun, 10000); // HACK
        state = state.set('launcherType', action.launcherType)
            .set('firstRun', getStoredFirstRun()) // action.firstRu
            .update('chain', (chain) => chain.merge(Immutable.fromJS(action.config.chain || {})));
        if (action.config.settings) {
            state = state.set('terms', action.config.settings.terms);
        }
        return state;
    }
    return state;
}

function onMessage(state, action) {
    if (action.type === 'LAUNCHER/MESSAGE') {
        return state.update('message', (m) => {
            m.set('text', action.msg).set('level', action.level);
        });
    }
    return state;
}

function onServiceStatus(state, action) {
    if (action.type === 'LAUNCHER/SERVICE_STATUS') {
        return state.setIn(['status', action.service], action.mode);
    }
    return state;
}

function onChain(state, action) {
    if (action.type === 'LAUNCHER/CHAIN') {
        return state.update('chain', (chain) =>
            chain.set('rpc', action.rpc)
                .set('url', action.url)
        );
    }
    return state;
}

function onSettingUpdate(state, action) {
    if (action.type === 'LAUNCHER/SETTINGS') {
        return state.set('settingsUpdated', action.updated);
    }
    return state;
}

function onTerms(state, action) {
    if (action.type === 'LAUNCHER/TERMS') {
        return state.set('terms', action.version);
    }
    return state;
}

export default function launcherReducers(state, action) {
    state = state || initial;
    state = onConfig(state, action);
    state = onMessage(state, action);
    state = onServiceStatus(state, action);
    state = onChain(state, action);
    state = onSettingUpdate(state, action);
    state = onTerms(state, action);
    return state;
}
