const { BlockchainCode } = require('@emeraldwallet/core');
const { Services, BlockchainStatus } = require('@emeraldwallet/services');

function createServices2(webContents, apiAccess) {
  const services = new Services();
  services.add(new BlockchainStatus(BlockchainCode.ETC, webContents, apiAccess));
  services.add(new BlockchainStatus(BlockchainCode.ETH, webContents, apiAccess));
  return services;
}

module.exports = {
  createServices2,
};
