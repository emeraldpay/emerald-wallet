const newGethDownloader = require('../electron/geth/downloader').newGethDownloader;

const downloader = newGethDownloader(null, './');

downloader.downloadIfNotExists()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error during downloading geth:', error);
    process.exit(1);
  });
