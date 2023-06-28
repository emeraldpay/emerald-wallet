import { BlockchainCode, PersistentState } from '@emeraldwallet/core';
import { Dispatched } from '../types';
import { ActionTypes, InitTokenStateAction, SetTokenBalanceAction, TokenBalance } from './types';

export function initState(balances: PersistentState.Balance[]): Dispatched<void, InitTokenStateAction> {
  return (dispatch, getState) => {
    const {
      application: { tokens },
    } = getState();

    dispatch({
      type: ActionTypes.INIT_STATE,
      payload: { balances, tokens },
    });
  };
}

export function setTokenBalance(
  blockchain: BlockchainCode,
  address: string,
  contractAddress: string,
  balance: TokenBalance,
): SetTokenBalanceAction {
  return {
    type: ActionTypes.SET_TOKEN_BALANCE,
    payload: { address, blockchain, balance, contractAddress },
  };
}
