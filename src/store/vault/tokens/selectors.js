// @flow
import { Map, List } from 'immutable';

export const balancesByAddress = (state, address: string) => state.get('balances', Map()).get(address, List());

export const balanceByAddress = (state, tokenAddress: string, address: string) => {
  const tokenBalance = balancesByAddress(state, address).find((b) => b.get('address') === tokenAddress);
  if (tokenBalance) {
    return tokenBalance.get('balance');
  }
  return null;
};
