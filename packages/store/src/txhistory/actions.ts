import {ActionTypes, UpdateTxsAction} from "./types";

export function updateTxs(transactions: any): UpdateTxsAction {
  return {
    type: ActionTypes.UPDATE_TXS,
    payload: transactions
  }
}
