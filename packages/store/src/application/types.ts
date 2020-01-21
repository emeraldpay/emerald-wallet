export const moduleName = 'application';

export enum ActionTypes {
  SET_CONNECTING = 'LAUNCHER/CONNECTING',
  CONFIG = 'LAUNCHER/CONFIG'
}
export interface ISetConnectingAction {
  type: ActionTypes.SET_CONNECTING;
  payload: boolean;
}

export interface IConfigAction {
  type: ActionTypes.CONFIG;
  payload: any;
}
