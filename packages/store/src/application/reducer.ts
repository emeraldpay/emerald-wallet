import { fromJS } from 'immutable';

const initial = fromJS({
  settingsUpdated: false,
  connecting: true,
  launcherType: 'web',
  terms: 'none',
  configured: false,
  message: {
    text: 'Starting...',
    level: 2
  }
});

function onConfig (state: any, action: any) {
  const config = action.payload;
  if (action.type === 'LAUNCHER/CONFIG') {
    state = state.set('configured', true);

    if (config.terms) {
      state = state.set('terms', config.terms);
    }
    return state;
  }
  return state;
}

function onMessage (state: any, action: any) {
  if (action.type === 'LAUNCHER/MESSAGE') {
    return state.set('message', fromJS({
      text: action.msg,
      level: action.level
    }));
  }
  return state;
}

function onServiceStatus (state: any, action: any) {
  if (action.type === 'LAUNCHER/SERVICE_STATUS') {
    return state.update(action.service, (service: any) => service.merge(fromJS(action.mode)));
  }
  return state;
}

function onSettingUpdate (state: any, action: any) {
  if (action.type === 'LAUNCHER/SETTINGS') {
    return state.set('settingsUpdated', action.updated);
  }
  return state;
}

function onTerms (state: any, action: any) {
  if (action.type === 'LAUNCHER/TERMS') {
    return state.set('terms', action.version);
  }
  return state;
}

function onConnecting (state: any, action: any) {
  if (action.type === 'LAUNCHER/CONNECTING') {
    return state.set('connecting', action.payload);
  }
  return state;
}

export function reducer (state: any, action: any) {
  state = state || initial;
  state = onConfig(state, action);
  state = onMessage(state, action);
  state = onServiceStatus(state, action);
  state = onSettingUpdate(state, action);
  state = onTerms(state, action);
  state = onConnecting(state, action);
  return state;
}
