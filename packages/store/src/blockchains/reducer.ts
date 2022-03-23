import produce from 'immer';
import { ActionTypes, BlockchainsAction, IBlockchainsState } from './types';

export const INITIAL_STATE: IBlockchainsState = {};

function onBlock (state: IBlockchainsState, payload: any): IBlockchainsState {
  return produce(state, (draft) => {
    if (!draft[payload.blockchain]) {
      draft[payload.blockchain] = {
        height: payload.height
      };
    } else {
      draft[payload.blockchain].height = payload.height;
    }
  });
}


export function reducer (
  state: IBlockchainsState = INITIAL_STATE,
  action: BlockchainsAction
): IBlockchainsState {
  if (!state) {
    state = INITIAL_STATE;
  }
  switch (action.type) {
    case ActionTypes.BLOCK:
      return onBlock(state, action.payload);
    default:
      return state;
  }
}
