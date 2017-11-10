const os = require('os');
const process = require('process');
const Downloader = require('./downloader').Downloader;

const config = {
    format: 'v1',
    channel: 'stable',
    app: {
        version: '0.16.2',
    },
    download: [
        {
            platform: 'osx',
            binaries: [
                {
                    type: 'https',
                    pack: 'zip',
                    url: 'https://github.com/ethereumproject/emerald-cli/releases/download/v0.16.2/emerald-cli-osx-v0.16.2-c9f6990.zip',
                },
            ],
            signatures: [
                {
                    type: 'pgp',
                    url: 'https://github.com/ethereumproject/emerald-cli/releases/download/v0.16.2/emerald-cli-osx-v0.16.2-c9f6990.zip.asc',
                },
            ],
        },
        {
            platform: 'windows',
            binaries: [
                {
                    type: 'https',
                    pack: 'zip',
                    url: 'https://github.com/ethereumproject/emerald-cli/releases/download/v0.16.2/emerald-stable-x86_64-pc-windows-msvc-v0.16.2-c9f6990.zip',
                },
            ],
            signatures: [
                {
                    type: 'pgp',
                    url: 'https://github.com/ethereumproject/emerald-cli/releases/download/v0.16.2/emerald-stable-x86_64-pc-windows-msvc-v0.16.2-c9f6990.zip.asc',
                },
            ],
        },
        {
            platform: 'linux',
            binaries: [
                {
                    type: 'https',
                    pack: 'zip',
                    url: ' https://github.com/ethereumproject/emerald-cli/releases/download/v0.16.2/emerald-cli-linux-v0.16.2-c9f6990.zip',
                },
            ],
            signatures: [
                {
                    type: 'pgp',
                    url: 'https://github.com/ethereumproject/emerald-cli/releases/download/v0.16.2/emerald-cli-linux-v0.16.2-c9f6990.zip.asc',
                },
            ],
        },
    ],
};
const signers = ['-----BEGIN PGP PUBLIC KEY BLOCK-----\n' +
'\n' +
'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\n' +
'Xg4=\n' +
'=hEcw\n' +
'-----END PGP PUBLIC KEY BLOCK-----'];

const suffix = os.platform() === 'win32' ? '.exe' : '';
const fileName = `emerald${suffix}`;

const downloader = new Downloader(config, fileName, './', signers);
downloader.on('notify', (message) => {
    console.log(message);
});

downloader.downloadIfNotExists()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error during downloading emerald-cli:', error);
        process.exit(1);
    });
