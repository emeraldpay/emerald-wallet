// @flow
export const getAll = (state, defaultValue) => state.addresses.get('addresses', defaultValue);

export const selectAccount = (state, id) => {
  if (!id) {
    return null;
  }
  return state.addresses.get('addresses').find((a) => a.get('id') === id.toLowerCase());
};
