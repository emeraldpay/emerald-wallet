export enum ActionTypes {
  UPDATE_TXS = 'WALLET/HISTORY/UPDATE_TXS'
}

export interface UpdateTxsAction {
  type: ActionTypes.UPDATE_TXS;
  payload: any;
}
