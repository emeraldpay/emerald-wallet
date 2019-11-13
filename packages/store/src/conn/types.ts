export enum ActionTypes {
  SET_STATUS = 'CONN/SET_STATUS'
}

export interface ISetStatusAction {
  type: ActionTypes.SET_STATUS;
  status: string;
}

export type ConnAction =
  | ISetStatusAction
  ;
