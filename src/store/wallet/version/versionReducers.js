import getWalletVersion from '../../../../scripts/get-wallet-version';

async function onGetWallet(state) {
  return {
    ...state,
    version: await getWalletVersion()
  };
}

export default function screenreducers(state, action) {
  state = onGetWallet(state);
  return state;
}
