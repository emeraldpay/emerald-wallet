import { TokenRegistry, blockchainIdToCode } from '@emeraldwallet/core';
import produce from 'immer';
import { ActionTypes, InitTokenStateAction, SetTokenBalanceAction, TokensAction, TokensState } from './types';

export const INITIAL_STATE: TokensState = {};

function onInitState(state: TokensState, { payload: { balances, tokens } }: InitTokenStateAction): TokensState {
  const tokenRegistry = new TokenRegistry(tokens);

  return produce(state, (draft) =>
    balances.forEach(({ address, amount, asset, blockchain }) => {
      const blockchainCode = blockchainIdToCode(blockchain);

      if (tokenRegistry.hasAddress(blockchainCode, asset)) {
        const token = tokenRegistry.byAddress(blockchainCode, asset);

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
                unitsValue: amount,
              },
            },
          };
        }
      }
    }),
  );
}

function onSetTokenBalance(state: TokensState, action: SetTokenBalanceAction): TokensState {
  const { address, blockchain, balance, contractAddress } = action.payload;

  return produce(state, (draft) => {
    draft[blockchain] = {
      ...draft[blockchain],
      [address]: {
        ...draft[blockchain]?.[address],
        [contractAddress.toLowerCase()]: { ...balance },
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
