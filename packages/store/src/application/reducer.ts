import produce from 'immer';
import {
  ActionTypes,
  ApplicationAction,
  ApplicationState,
  ConfigAction,
  ConnectingAction,
  MessageAction,
  OptionsAction,
  SettingsAction,
  TermsAction,
  TokensAction,
} from './types';
import {isBlockchainId} from "@emeraldwallet/core";

export const INITIAL_STATE: ApplicationState = {
  configured: false,
  connecting: true,
  launcherType: 'web',
  message: {
    level: 2,
    message: 'Starting...',
  },
  options: {},
  settingsUpdated: false,
  terms: 'none',
  tokens: [],
};

function onConfig(state: ApplicationState, { payload: { options, terms, tokens } }: ConfigAction): ApplicationState {
  return {
    ...state,
    configured: true,
    options: options ?? state.options,
    terms: terms ?? state.terms,
    tokens: tokens?.filter((token) => isBlockchainId(token.blockchain)) ?? state.tokens,
  };
}

function onConnecting(state: ApplicationState, action: ConnectingAction): ApplicationState {
  return {
    ...state,
    connecting: action.payload,
  };
}

function onMessage(state: ApplicationState, action: MessageAction): ApplicationState {
  return produce(state, (draft) => {
    draft.message = {
      level: action.level,
      message: action.message,
    };
  });
}

function onOptions(state: ApplicationState, action: OptionsAction): ApplicationState {
  return {
    ...state,
    options: action.payload,
  };
}

function onSetting(state: ApplicationState, action: SettingsAction): ApplicationState {
  return {
    ...state,
    settingsUpdated: action.updated,
  };
}

function onTerms(state: ApplicationState, action: TermsAction): ApplicationState {
  return {
    ...state,
    terms: action.version,
  };
}

function onTokens(state: ApplicationState, action: TokensAction): ApplicationState {
  return {
    ...state,
    tokens: action.payload.filter((token) => isBlockchainId(token.blockchain)),
  };
}

export function reducer(state = INITIAL_STATE, action: ApplicationAction): ApplicationState {
  switch (action.type) {
    case ActionTypes.CONFIG:
      return onConfig(state, action);
    case ActionTypes.MESSAGE:
      return onMessage(state, action);
    case ActionTypes.CONNECTING:
      return onConnecting(state, action);
    case ActionTypes.OPTIONS:
      return onOptions(state, action);
    case ActionTypes.SETTINGS:
      return onSetting(state, action);
    case ActionTypes.TERMS:
      return onTerms(state, action);
    case ActionTypes.TOKENS:
      return onTokens(state, action);
    default:
      return state;
  }
}
