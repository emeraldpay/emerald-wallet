import produce from 'immer';
import { ActionTypes, BlockchainsAction, BlockchainsState } from './types';

export const INITIAL_STATE: BlockchainsState = {};

function onBlock (state: BlockchainsState, payload: any): BlockchainsState {
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
  state: BlockchainsState = INITIAL_STATE,
  action: BlockchainsAction
): BlockchainsState {
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
