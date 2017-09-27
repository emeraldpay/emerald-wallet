export const getAll = (state, defaultValue) => state.accounts.get('accounts', defaultValue);
export const selectAccount = (state, id) => state.accounts.get('accounts').find((a) => a.get('id') === id);
