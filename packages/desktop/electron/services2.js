const { BlockchainCode } = require('@emeraldwallet/core');
const { Services, BlockchainStatus } = require('@emeraldwallet/services');

function createServices2(webContents) {
  const services = new Services();
  services.add(new BlockchainStatus(BlockchainCode.ETC, webContents));
  services.add(new BlockchainStatus(BlockchainCode.ETH, webContents));
  return services;
}

module.exports = {
  createServices2,
};
