export const fiatCurrency = (state) => state.wallet.settings.get('localeCurrency');
export const fiatRate = (chain, state) => state.wallet.settings.getIn(['rates', chain.toUpperCase()]);
