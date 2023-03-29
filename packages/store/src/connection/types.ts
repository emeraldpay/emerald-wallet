export const moduleName = 'connection';

export interface ConnectionState {
  status: string;
}

export enum ActionTypes {
  SET_STATUS = 'CONNECTION/SET_STATUS',
}

export enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
}

export interface SetStatusAction {
  type: ActionTypes.SET_STATUS;
  payload: {
    status: string;
  };
}

export type ConnectionAction = SetStatusAction;
