const DefaultGeth = {
  format: 'v1',
  channel: 'stable',
  app: {
    version: '5.5.1',
  },
  download: [
    {
      platform: 'osx',
      binaries: [
        {
          type: 'https',
          pack: 'zip',
          url: 'https://github.com/ethereumproject/go-ethereum/releases/download/v5.5.1/geth-classic-osx-v5.5.1-8a3bc2d.zip',

        },
      ],
      signatures: [
        {
          type: 'pgp',
          url: 'https://github.com/ethereumproject/go-ethereum/releases/download/v5.5.1/geth-classic-osx-v5.5.1-8a3bc2d.zip.asc',
        },
      ],
    },
    {
      platform: 'windows',
      binaries: [
        {
          type: 'https',
          pack: 'zip',
          url: 'https://github.com/ethereumproject/go-ethereum/releases/download/v5.5.1/geth-classic-win64-v5.5.1-8a3bc2d.zip',
        },
      ],
      signatures: [
        {
          type: 'pgp',
          url: 'https://github.com/ethereumproject/go-ethereum/releases/download/v5.5.1/geth-classic-win64-v5.5.1-8a3bc2d.zip.asc',
        },
      ],
    },
    {
      platform: 'linux',
      binaries: [
        {
          type: 'https',
          pack: 'zip',
          url: 'https://github.com/ethereumproject/go-ethereum/releases/download/v5.5.1/geth-classic-linux-v5.5.1-8a3bc2d.zip',
        },
      ],
      signatures: [
        {
          type: 'pgp',
          url: 'https://github.com/ethereumproject/go-ethereum/releases/download/v5.5.1/geth-classic-linux-v5.5.1-8a3bc2d.zip.asc',
        },
      ],
    },
  ],
};

module.exports = {
  DefaultGeth,
};
