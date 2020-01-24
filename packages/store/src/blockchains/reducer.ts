import produce from 'immer';
import { ActionTypes, BlockchainsAction, IBlockchainsState } from './types';

export const INITIAL_STATE: IBlockchainsState = {};

function onBlock (state: IBlockchainsState, payload: any): IBlockchainsState {
  return produce(state, (draft) => {
    if (!draft[payload.blockchain]) {
      draft[payload.blockchain] = {
        gasPrice: null,
        height: payload.height
      };
    } else {
      draft[payload.blockchain].height = payload.height;
    }
  });
}

function onGasPrice (state: IBlockchainsState, payload: any): IBlockchainsState {
  return produce(state, (draft) => {
    if (!draft[payload.blockchain]) {
      draft[payload.blockchain] = {
        height: null,
        gasPrice: payload.gasPrice
      };
    } else {
      draft[payload.blockchain].gasPrice = payload.gasPrice;
    }
  });
}

export function reducer (
  state: IBlockchainsState = INITIAL_STATE,
  action: BlockchainsAction
): IBlockchainsState {
  switch (action.type) {
    case ActionTypes.BLOCK:
      return onBlock(state, action.payload);
    case ActionTypes.GAS_PRICE:
      return onGasPrice(state, action.payload);
    default:
      return state;
  }
}
