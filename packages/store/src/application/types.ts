export const moduleName = 'application';

export enum ActionTypes {
  CONFIG = 'LAUNCHER/CONFIG',
  CONNECTING = 'LAUNCHER/CONNECTING',
  MESSAGE = 'LAUNCHER/MESSAGE',
  OPTIONS = 'LAUNCHER/OPTIONS',
  SETTINGS = 'LAUNCHER/SETTINGS',
  TERMS = 'LAUNCHER/TERMS',
}

export interface ApplicationMessage {
  level: number;
  message: string;
}

export interface ApplicationOptions {
  [key: string]: boolean | number | string | null | undefined;
}

export interface ApplicationState {
  configured: boolean;
  connecting: boolean;
  launcherType: string;
  message: ApplicationMessage;
  options: ApplicationOptions;
  settingsUpdated: boolean;
  terms: string;
}

export interface ConfigAction {
  type: ActionTypes.CONFIG;
  payload: {
    terms?: string;
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
  payload: ApplicationOptions;
}

export interface SettingsAction {
  type: ActionTypes.SETTINGS;
  updated: boolean;
}

export interface TermsAction {
  type: ActionTypes.TERMS;
  version: string;
}

export type ApplicationAction =
  | ConfigAction
  | ConnectingAction
  | MessageAction
  | OptionsAction
  | SettingsAction
  | TermsAction;
