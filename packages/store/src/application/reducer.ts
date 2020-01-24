import produce from 'immer';
import { ActionTypes } from './types';

export const INITIAL_STATE = {
  settingsUpdated: false,
  connecting: true,
  launcherType: 'web',
  terms: 'none',
  configured: false,
  message: {
    text: 'Starting...',
    level: 2
  }
};

function onConfig (state: any, action: any) {
  const config = action.payload;
  if (action.type === ActionTypes.CONFIG) {
    return produce(state, (draft: any) => {
      draft.configured = true;
      if (config.terms) {
        draft.terms = config.terms;
      }
    });
  }
  return state;
}

function onMessage (state: any, action: any) {
  if (action.type === ActionTypes.MESSAGE) {
    return produce(state, (draft: any) => {
      draft.message = {
        text: action.msg,
        level: action.level
      };
    });
  }
  return state;
}

function onSettingUpdate (state: any, action: any) {
  if (action.type === ActionTypes.SETTINGS) {
    return {
      ...state,
      settingsUpdated: action.updated
    };
  }
  return state;
}

function onTerms (state: any, action: any) {
  if (action.type === ActionTypes.TERMS) {
    return {
      ...state,
      terms: action.version
    };
  }
  return state;
}

function onConnecting (state: any, action: any) {
  if (action.type === ActionTypes.SET_CONNECTING) {
    return {
      ...state,
      connecting: action.payload
    };
  }
  return state;
}

export function reducer (state: any, action: any) {
  state = state || INITIAL_STATE;
  state = onConfig(state, action);
  state = onMessage(state, action);
  state = onSettingUpdate(state, action);
  state = onTerms(state, action);
  state = onConnecting(state, action);
  return state;
}
