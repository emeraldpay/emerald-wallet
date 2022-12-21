import { SettingsOptions, TokenData } from '@emeraldwallet/core';

export const moduleName = 'application';

export enum ActionTypes {
  CONFIG = 'LAUNCHER/CONFIG',
  CONNECTING = 'LAUNCHER/CONNECTING',
  MESSAGE = 'LAUNCHER/MESSAGE',
  OPTIONS = 'LAUNCHER/OPTIONS',
  SETTINGS = 'LAUNCHER/SETTINGS',
  TERMS = 'LAUNCHER/TERMS',
  TOKENS = 'LAUNCHER/TOKENS',
}

export interface ApplicationMessage {
  level: number;
  message: string;
}

export interface ApplicationState {
  configured: boolean;
  connecting: boolean;
  launcherType: string;
  message: ApplicationMessage;
  options: SettingsOptions;
  settingsUpdated: boolean;
  terms: string;
  tokens: TokenData[];
}

export interface ConfigAction {
  type: ActionTypes.CONFIG;
  payload: {
    options?: SettingsOptions;
    terms?: string;
    tokens?: TokenData[];
  };
}

export interface ConnectingAction {
  type: ActionTypes.CONNECTING;
  payload: boolean;
}

export interface MessageAction {
  type: ActionTypes.MESSAGE;
  level: number;
  message: string;
}

export interface OptionsAction {
  type: ActionTypes.OPTIONS;
  payload: SettingsOptions;
}

export interface SettingsAction {
  type: ActionTypes.SETTINGS;
  updated: boolean;
}

export interface TermsAction {
  type: ActionTypes.TERMS;
  version: string;
}

export interface TokensAction {
  type: ActionTypes.TOKENS;
  payload: TokenData[];
}

export type ApplicationAction =
  | ConfigAction
  | ConnectingAction
  | MessageAction
  | OptionsAction
  | SettingsAction
  | TermsAction
  | TokensAction;
