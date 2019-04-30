export function gasPrice(state) {
  return state.network.get('gasPrice').toWei();
}

export function chain(state) {
  return state.network.get('chain');
}
