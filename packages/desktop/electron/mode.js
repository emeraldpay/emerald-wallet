const LocalMode = {
  id: 'local',
  chains: ['ETH', 'ETC'],
  currencies: ['USD', 'EUR', 'USDT', 'BTC'],
};

// TODO have only testnets here
const DevMode = {
  id: 'development',
  chains: ['KOVAN', 'MORDEN', 'ETH', 'ETC'],
  currencies: ['USD', 'MONOPOLY'],
};

const ProdMode = {
  id: 'production',
  chains: ['ETH', 'ETC'],
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
