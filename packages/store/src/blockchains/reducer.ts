import {ActionTypes, BlockchainsAction, IBlockchainsState,} from "./types";

export const INITIAL_STATE: IBlockchainsState = new Map();


function onBlock(state: IBlockchainsState, payload: any): IBlockchainsState {
  const current = state.get(payload.blockchain);
  const newState = current ?
    {
      ...current,
      height: payload.height,
    } : {
      gasPrice: null,
      height: payload.height,
    };

  return state.set(payload.blockchain, newState);
}

function onGasPrice(state: IBlockchainsState, payload: any): IBlockchainsState {
  const current = state.get(payload.blockchain);
  const newState = current ?
    {
      ...current,
      gasPrice: payload.gasPrice,
    } : {
      height: null,
      gasPrice: payload.gasPrice,
    };

  return state.set(payload.blockchain, newState);
}

export function reducer(
  state: IBlockchainsState = INITIAL_STATE,
  action: BlockchainsAction
): IBlockchainsState {
  switch(action.type) {
    case ActionTypes.BLOCK:
      return onBlock(state, action.payload);
    case ActionTypes.GAS_PRICE:
      return onGasPrice(state, action.payload);
    default:
      return state;
  }
}
