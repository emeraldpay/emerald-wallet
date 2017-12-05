// @flow
import { Wei } from 'emerald-js';
import { List } from 'immutable';

export const getAll = (state, defaultValue) => state.accounts.get('accounts', defaultValue);
export const selectAccount = (state, id) => state.accounts.get('accounts').find((a) => a.get('id') === id);
export const selectTotalBalance = (state) => state.accounts.get('accounts', List())
  .map((account) => (account.get('balance') ? account.get('balance') : Wei.ZERO))
  .reduce((t, v) => t.plus(v), Wei.ZERO);
