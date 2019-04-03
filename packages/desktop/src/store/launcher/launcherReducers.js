import Immutable from 'immutable';
import { api } from '../../lib/rpc/api';

const STATUS_NOT_READY = 'not ready';

const initial = Immutable.fromJS({
  firstRun: false,
  settingsUpdated: false,
  connecting: true,
  launcherType: 'web',
  terms: 'none',
  chain: {
    client: null,
  },

  geth: {
    url: '',
    status: STATUS_NOT_READY,
    type: 'none',
  },

  connector: {
    url: '',
    status: STATUS_NOT_READY,
  },

  message: {
    text: 'Starting...',
    level: 2,
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
    state = state
      .set('launcherType', action.launcherType)
      .set('firstRun', getStoredFirstRun()) // action.firstRun
      .update('geth', (geth) => geth.merge(Immutable.fromJS(action.config.geth || {})))
      .update('chain', (chain) => chain.merge(Immutable.fromJS(action.config.chain || {})));

    if (action.config.terms) {
      state = state.set('terms', action.config.terms);
    }

    if (action.config.chain) {
      state = state.setIn(['chain', 'client'], action.config.chain.client);
    }

    // TODO: remove this hack
    if (typeof state.getIn(['chain', 'name']) === 'string') {
      // api.updateGethUrl(state.getIn(['geth', 'url']));
      api.updateChain(state.getIn(['chain', 'name']));
    }
    return state;
  }
  return state;
}

function onMessage(state, action) {
  if (action.type === 'LAUNCHER/MESSAGE') {
    return state.set('message', Immutable.fromJS({
      text: action.msg,
      level: action.level,
    }));
  }
  return state;
}

function onServiceStatus(state, action) {
  if (action.type === 'LAUNCHER/SERVICE_STATUS') {
    return state.update(action.service, (service) => service.merge(Immutable.fromJS(action.mode)));
  }
  return state;
}

function onChain(state, action) {
  if (action.type === 'LAUNCHER/CHAIN') {
    return state.update('chain', (chain) => chain.set('name', action.chain).set('id', action.chainId));
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

function onConnecting(state, action) {
  if (action.type === 'LAUNCHER/CONNECTING') {
    return state.set('connecting', action.value);
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
  state = onConnecting(state, action);
  return state;
}
