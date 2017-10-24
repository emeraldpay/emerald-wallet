const DefaultGeth = {
    format: 'v1',
    channel: 'stable',
    app: {
        version: '4.0.0',
    },
    download: [
        {
            platform: 'osx',
            binaries: [
                {
                    type: 'https',
                    pack: 'zip',
                    url: 'https://github.com/ethereumproject/go-ethereum/releases/download/v4.0.0/geth-classic-osx-v4.0.0.zip',
                },
            ],
            signatures: [
                {
                    type: 'pgp',
                    url: 'https://github.com/ethereumproject/go-ethereum/releases/download/v4.0.0/geth-classic-osx-v4.0.0.zip.asc',
                },
            ],
        },
        {
            platform: 'windows',
            binaries: [
                {
                    type: 'https',
                    pack: 'zip',
                    url: 'https://github.com/ethereumproject/go-ethereum/releases/download/v4.0.0/geth-classic-win64-v4.0.0.zip',
                },
            ],
            signatures: [
                {
                    type: 'pgp',
                    url: 'https://github.com/ethereumproject/go-ethereum/releases/download/v4.0.0/geth-classic-win64-v4.0.0.zip.asc',
                },
            ],
        },
        {
            platform: 'linux',
            binaries: [
                {
                    type: 'https',
                    pack: 'zip',
                    url: 'https://github.com/ethereumproject/go-ethereum/releases/download/v4.0.0/geth-classic-linux-v4.0.0.zip',
                },
            ],
            signatures: [
                {
                    type: 'pgp',
                    url: 'https://github.com/ethereumproject/go-ethereum/releases/download/v4.0.0/geth-classic-linux-v4.0.0.zip.asc',
                },
            ],
        },
    ],
};

module.exports = {
    DefaultGeth,
};
