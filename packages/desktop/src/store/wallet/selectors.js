import tokens from 'store/vault/tokens';
import network from 'store/network';
import {findNetwork} from 'lib/networks';

export const balance = (state, address, token) => {
  if (token === 'ETC') {
    const selectedAccount = state.accounts.get('accounts').find((acnt) => acnt.get('id') === address);
    const newBalance = selectedAccount.get('balance');
    return newBalance.getEther().toString();
  }

  return tokens.selectors.balanceByTokenSymbol(state.tokens, token, address).getDecimalized();
};

export const currentBlockchain = (state) => {
  const currentChain = network.selectors.chain(state).toJS();
  const currentEndpoint = state.launcher.get('geth').toJS();
  const net = findNetwork(currentEndpoint.url, currentChain.id) || {};
  return net.blockchain;
};
