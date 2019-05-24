import {
  BlockchainsAction,
  IBlockchain,
  IBlockchainsState,
  ActionTypes,
} from "./types";

export const INITIAL_STATE: IBlockchainsState = new Map();


function onBlock(state: IBlockchainsState, payload: any): IBlockchainsState {
  const current = state.get(payload.chain);
  const newState = current ?
    {
      ...current,
      height: payload.height,
    } : {
      gasPrice: null,
      height: payload.height,
    };

  return state.set(payload.chain, newState);
}

export function reducer(
  state: IBlockchainsState = INITIAL_STATE,
  action: BlockchainsAction
): IBlockchainsState {
  switch(action.type) {
    case ActionTypes.BLOCK:
      return onBlock(state, action.payload);
    default:
      return state;
  }
}
