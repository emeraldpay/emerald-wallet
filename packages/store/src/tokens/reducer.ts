import produce from 'immer';
import { ActionTypes, SetTokenBalanceAction, TokensAction, TokensState } from './types';

export const INITIAL_STATE: TokensState = {};

function onSetTokenBalance(state: TokensState, action: SetTokenBalanceAction): TokensState {
  const { blockchain, address, balance } = action.payload;

  return produce(state, (draft) => {
    draft[blockchain] = {
      ...draft[blockchain],
      [address]: {
        ...draft[blockchain]?.[address],
        [balance.tokenId]: { ...balance },
      },
    };
  });
}

export function reducer(state: TokensState = INITIAL_STATE, action: TokensAction): TokensState {
  switch (action.type) {
    case ActionTypes.SET_TOKEN_BALANCE:
      return onSetTokenBalance(state, action);
  }

  return state;
}
