export const moduleName = 'conn';

export enum ActionTypes {
  SET_STATUS = 'CONN/SET_STATUS'
}

export enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED'
}

export interface ISetStatusAction {
  type: ActionTypes.SET_STATUS;
  payload: {
    status: string
  };
}

export type ConnAction =
  | ISetStatusAction
  ;
