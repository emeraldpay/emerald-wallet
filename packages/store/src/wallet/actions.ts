import { ActionTypes, IOpenAccDetailsAction } from './types';

export function openAccountDetails (chain: any, address: any): IOpenAccDetailsAction {
  return {
    type: ActionTypes.OPEN_ACCOUNT_DETAILS,
    payload: {
      address,
      chain
    }
  };
}
