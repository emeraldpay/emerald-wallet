const os = require('os');
const process = require('process');
const { Downloader, getPlatformConfig } = require('@emeraldplatform/util');

const config = {
  format: 'v1',
  channel: 'stable',
  app: {
    version: '0.25.5',
  },
  download: [
    {
      platform: 'osx',
      binaries: [
        {
          type: 'https',
          pack: 'zip',
          url: 'https://dl.emeraldwallet.io/releases/emerald-cli-v0.25.5/emerald-cli-mac-v0.25.5-5cc40e2.zip',
        },
      ],
      signatures: [
        {
          type: 'pgp',
          url: 'https://dl.emeraldwallet.io/releases/emerald-cli-v0.25.5/emerald-cli-mac-v0.25.5-5cc40e2.zip.asc',
        },
      ],
    },
    {
      platform: 'windows',
      binaries: [
        {
          type: 'https',
          pack: 'zip',
          url: 'https://dl.emeraldwallet.io/releases/emerald-cli-v0.25.5/emerald-cli-win-v0.25.5-5cc40e2.zip',
        },
      ],
      signatures: [
        {
          type: 'pgp',
          url: 'https://dl.emeraldwallet.io/releases/emerald-cli-v0.25.5/emerald-cli-win-v0.25.5-5cc40e2.zip.asc',
        },
      ],
    },
    {
      platform: 'linux',
      binaries: [
        {
          type: 'https',
          pack: 'zip',
          url: 'https://dl.emeraldwallet.io/releases/emerald-cli-v0.25.5/emerald-cli-linux-v0.25.5-5cc40e2.zip',
        },
      ],
      signatures: [
        {
          type: 'pgp',
          url: 'https://dl.emeraldwallet.io/releases/emerald-cli-v0.25.5/emerald-cli-linux-v0.25.5-5cc40e2.zip.asc',
        },
      ],
    },
  ],
};
const signers = ['-----BEGIN PGP PUBLIC KEY BLOCK-----\n' +
'\n' +
'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\n' +
'adpYEwT7ZDoRcND0\n' +
'=hCZx\n' +
'-----END PGP PUBLIC KEY BLOCK-----'];

const suffix = os.platform() === 'win32' ? '.exe' : '';
const fileName = `emerald${suffix}`;

const downloader = new Downloader(getPlatformConfig(config), fileName, './', signers);
downloader.on('notify', (message) => {
  console.log(message);
});
downloader.on('error', (error) => {
  console.error(error);
});

downloader.downloadIfNotExists()
  .then((result) => {
    if (result === 'exists') {
      console.log('emerald exists.');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during downloading emerald-cli:', error);
    process.exit(1);
  });
