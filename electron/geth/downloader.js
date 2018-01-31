const os = require('os');
const log = require('../logger');
const signers = require('./signers');
const { Downloader, getPlatformConfig } = require('emerald-js/lib/download');
const { DefaultGeth } = require('./config');

function newGethDownloader(notify, dir) {
  const suffix = os.platform() === 'win32' ? '.exe' : '';
  const fileName = `geth${suffix}`;
  const config = getPlatformConfig(DefaultGeth);

  const downloader = new Downloader(config, fileName, dir, signers.publicKeys);
  downloader.on('notify', (message) => {
    if (notify) {
      notify.info(message);
    }
    log.log(message);
  });
  downloader.on('error', (error) => {
    log.error(error);
  });
  return downloader;
}

module.exports = {
  newGethDownloader,
  Downloader,
};
