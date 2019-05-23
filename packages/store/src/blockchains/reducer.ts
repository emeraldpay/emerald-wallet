import {
  BlockchainsAction,
  IBlockchain,
  IBlockchainsState,
  Actions,
} from "./types";

export const INITIAL_STATE: IBlockchainsState = new Map();


function onBlock(state: IBlockchainsState, payload: any): IBlockchainsState {
  const current = state.get(payload.chain);
  state.set(payload.chain, {
    ...current,
    height: payload.height
  });
  return state;
}

export function reducer(
  state: IBlockchainsState = INITIAL_STATE,
  action: BlockchainsAction
): IBlockchainsState {
  switch(action.type) {
    case Actions.BLOCK:
      return onBlock(state, action.payload);
    default:
      return state;
  }
}
