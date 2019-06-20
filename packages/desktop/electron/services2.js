const { BlockchainCode } = require('@emeraldwallet/core');
const {
  Services, BlockchainStatus, BalanceListener, TransactionListener,
} = require('@emeraldwallet/services');

function createServices2(ipcMain, webContents, apiAccess) {
  const services = new Services();
  services.add(new BalanceListener(ipcMain, webContents, apiAccess));
  services.add(new TransactionListener(ipcMain, webContents, apiAccess));
  const chains = [BlockchainCode.ETC, BlockchainCode.ETH];
  for (const chain of chains) {
    services.add(new BlockchainStatus(chain, webContents, apiAccess));
  }
  return services;
}

module.exports = {
  createServices2,
};
