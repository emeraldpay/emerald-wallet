export enum ActionTypes {
  OPEN_ACCOUNT_DETAILS = 'WALLET/OPEN_ACCOUNT_DETAILS'

}

export interface IOpenAccDetailsAction {
  type: ActionTypes.OPEN_ACCOUNT_DETAILS;
  payload: any;
}

export type WalletAction = IOpenAccDetailsAction;
