import { BlockchainCode } from '@emeraldwallet/core';
import { ActionTypes, ITokensState, SetTokenBalanceAction, TokensAction } from './types';

export const INITIAL_STATE: ITokensState = {};

function onSetTokenBalance (state: ITokensState, action: SetTokenBalanceAction): ITokensState {

  const { chain, address, balance } = action.payload;
  const chainState = state[chain as BlockchainCode] || {};
  const addressState = chainState[address] || {};

  const newState = {
    ...state,
    [chain]: {
      ...chainState,
      [address]: {
        ...addressState,
        [balance.tokenId]: { ...balance }
      }
    }
  };
  return newState;
}

export function reducer (
  state: ITokensState = INITIAL_STATE,
  action: TokensAction
): ITokensState {

  switch (action.type) {
    case ActionTypes.SET_TOKEN_BALANCE:
      return onSetTokenBalance(state, action);

  }
  return state;
}
