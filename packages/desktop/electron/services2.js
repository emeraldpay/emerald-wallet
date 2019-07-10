const {
  Services, BlockchainStatus, BalanceListener, TransactionListener,
} = require('@emeraldwallet/services');

function createServices2(ipcMain, webContents, apiAccess, chains) {
  const services = new Services();
  services.add(new BalanceListener(ipcMain, webContents, apiAccess));
  services.add(new TransactionListener(ipcMain, webContents, apiAccess));
  for (const chain of chains) {
    services.add(new BlockchainStatus(chain.toLowerCase(), webContents, apiAccess));
  }
  return services;
}

module.exports = {
  createServices2,
};
