const LocalMode = {
  id: 'local',
  chains: ['ETH', 'ETC', 'BTC', 'TESTBTC'],
  assets: ['ETH', 'ETC', 'BTC', 'TESTBTC', 'DAI', 'USDT'],
  currencies: ['USD', 'EUR', 'USDT', 'BTC'],
};

// TODO have only testnets here
const DevMode = {
  id: 'development',
  chains: ['KOVAN', 'ETH', 'ETC', 'TESTBTC', 'BTC'],
  assets: ['ETH', 'ETC', 'BTC', 'TESTBTC', 'DAI', 'USDT'],
  currencies: ['USD', 'MONOPOLY'],
};

const ProdMode = {
  id: 'production',
  chains: ['ETH', 'ETC', 'BTC'],
  assets: ['ETH', 'ETC', 'DAI', 'USDT'],
  currencies: ['USD', 'EUR', 'USDT', 'BTC'],
};


function sendMode(webContents, mode) {
  const action = {
    type: 'SETTINGS/MODE',
    payload: mode,
  };
  webContents.send('store', action);
}

module.exports = {
  LocalMode,
  DevMode,
  ProdMode,
  sendMode,
};
