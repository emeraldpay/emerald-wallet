export function gasPrice(state) {
  return state.network.get('gasPrice').value();
}
