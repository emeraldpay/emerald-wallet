// @flow

export function estimateGas(chain, tx) {
  const {
    from, to, gas, gasPrice, value, data,
  } = tx;
  return (dispatch, getState, api) => {
    return api.chain(chain).eth.estimateGas({
      from,
      to,
      gas: `0x${gas.toString(16)}`,
      gasPrice: gasPrice.toHex(),
      value: value.toHex(),
      data,
    });
  };
}
