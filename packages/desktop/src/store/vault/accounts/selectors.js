// @flow
import { Wei } from '@emeraldplatform/eth';
import { List } from 'immutable';

export const getAll = (state, defaultValue) => state.addresses.get('addresses', defaultValue);

export const selectAccount = (state, id) => {
  if (!id) {
    return null;
  }
  return state.addresses.get('addresses').find((a) => a.get('id') === id.toLowerCase());
};

export const selectTotalBalance = (chain, state) => state.addresses.get('addresses', List())
  .filter((account) => account.get('blockchain') === chain.toLowerCase())
  .map((account) => (account.get('balance') ? account.get('balance') : Wei.ZERO))
  .reduce((t, v) => t.plus(v), Wei.ZERO);
