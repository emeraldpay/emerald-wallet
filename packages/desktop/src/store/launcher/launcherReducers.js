import Immutable from 'immutable';

const initial = Immutable.fromJS({
  settingsUpdated: false,
  connecting: true,
  launcherType: 'web',
  terms: 'none',
  configured: false,
  message: {
    text: 'Starting...',
    level: 2,
  },
});

function onConfig(state, action) {
  if (action.type === 'LAUNCHER/CONFIG') {
    state = state
      .set('configured', true)
      .set('launcherType', action.launcherType);

    if (action.config.terms) {
      state = state.set('terms', action.config.terms);
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
  state = onSettingUpdate(state, action);
  state = onTerms(state, action);
  state = onConnecting(state, action);
  return state;
}
