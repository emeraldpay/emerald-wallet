import tokens from 'store/vault/tokens';
import network from 'store/network';
import {findNetwork} from 'lib/networks';
import launcher from '../launcher';

export const balance = (state, address, token) => {
  const blockchain = currentBlockchain(state);
  if (token === blockchain.params.coinTicker) {
    const selectedAccount = state.accounts.get('accounts').find((acnt) => acnt.get('id') === address);
    const newBalance = selectedAccount.get('balance');
    return newBalance.getEther().toString();
  }

  return tokens.selectors.balanceByTokenSymbol(state.tokens, token, address).getDecimalized();
};

export const currentBlockchain = (state) => {
  const currentChain = state.launcher.getIn(['chain', 'id']);
  const currentEndpoint = state.launcher.get('geth').toJS();
  const net = findNetwork(currentEndpoint.url, currentChain) || {};
  return net.blockchain;
};

export const showFiat = (state) => {
  const chainName = launcher.selectors.getChainName(state);
  return (chainName === 'mainnet' || chainName === 'etc');
};
