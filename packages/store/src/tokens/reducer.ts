import { TokenRegistry, blockchainIdToCode } from '@emeraldwallet/core';
import produce from 'immer';
import { ActionTypes, InitTokenStateAction, SetTokenBalanceAction, TokensAction, TokensState } from './types';

export const INITIAL_STATE: TokensState = {};

function onInitState(state: TokensState, action: InitTokenStateAction): TokensState {
  const tokenRegistry = new TokenRegistry(action.tokens);

  return produce(state, (draft) => {
    action.balances.forEach(({ address, amount, asset, blockchain }) => {
      const blockchainCode = blockchainIdToCode(blockchain);
      const token = tokenRegistry.bySymbol(blockchainCode, asset);

      const { [blockchainCode]: blockchainBalance = {} } = state;
      const { [address]: addressBalances = {} } = blockchainBalance;
      const { [token.address]: addressTokenBalance } = addressBalances;

      if (addressTokenBalance == null) {
        draft[blockchainCode] = {
          ...draft[blockchainCode],
          [address]: {
            ...draft[blockchainCode]?.[address],
            [token.address]: {
              decimals: token.decimals,
              symbol: token.symbol,
              tokenId: token.address,
              unitsValue: amount,
            },
          },
        };
      }
    });
  });
}

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
    case ActionTypes.INIT_STATE:
      return onInitState(state, action);
    case ActionTypes.SET_TOKEN_BALANCE:
      return onSetTokenBalance(state, action);
  }

  return state;
}
