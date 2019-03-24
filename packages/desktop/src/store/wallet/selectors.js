import tokens from 'store/vault/tokens';

export const balance = (state, address, token) => {
  if (token === 'ETC') {
    const selectedAccount = state.accounts.get('accounts').find((acnt) => acnt.get('id') === address);
    const newBalance = selectedAccount.get('balance');
    return newBalance.getEther().toString();
  }

  return tokens.selectors.balanceByTokenSymbol(state.tokens, token, address).getDecimalized();
};
