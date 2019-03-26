export function gasPrice(state) {
  return state.network.get('gasPrice').value();
}

export function chain(state) {
  return state.network.get('chain');
}
