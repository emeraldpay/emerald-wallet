import { BlockchainCode } from '@emeraldwallet/core';
import produce from 'immer';
import { ActionTypes, ISetTokenBalanceAction, ITokensState, TokensAction } from './types';

export const INITIAL_STATE: ITokensState = {};

// function onSetTokenBalance (state: ITokensState, action: ISetTokenBalanceAction): ITokensState {
//
//   const { chain, address, balance } = action.payload;
//   const chainState = state[chain as BlockchainCode] || {};
//   const addressState = chainState[address] || {};
//
//   const newState = {
//     ...state,
//     [chain]: {
//       ...chainState,
//       [address]: {
//         ...addressState,
//         [balance.tokenId]: { ...balance }
//       }
//     }
//   };
//   return newState;
// }

function onSetTokenBalance (state: ITokensState, action: ISetTokenBalanceAction): ITokensState {
  const { chain, address, balance } = action.payload;

  return produce(state, (draft) => {
    const chainCode = chain as BlockchainCode;
    if (!draft[chainCode]) {
      draft[chainCode] = {};
    }
    if (!draft[chainCode]![address]) {
      draft[chainCode]![address] = {};
    }
    draft[chainCode]![address][balance.tokenId] = { ...balance };
  });
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
