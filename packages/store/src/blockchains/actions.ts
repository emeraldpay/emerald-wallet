import {ActionTypes, IBlockAction} from './types';

export function blockAction (payload: {hash: string, height: any, blockchain: any}): IBlockAction {
  return {
    payload,
    type: ActionTypes.BLOCK
  };
}
