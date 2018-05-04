const DefaultGeth = {
  format: 'v1',
  channel: 'stable',
  app: {
    version: '5.2.0',
  },
  download: [
    {
      platform: 'osx',
      binaries: [
        {
          type: 'https',
          pack: 'zip',
          url: 'https://github.com/ethereumproject/go-ethereum/releases/download/v5.2.0/geth-classic-osx-v5.2.0-480f90a.zip',
        },
      ],
      signatures: [
        {
          type: 'pgp',
          url: 'https://github.com/ethereumproject/go-ethereum/releases/download/v5.2.0/geth-classic-osx-v5.2.0-480f90a.zip.asc',
        },
      ],
    },
    {
      platform: 'windows',
      binaries: [
        {
          type: 'https',
          pack: 'zip',
          url: 'https://github.com/ethereumproject/go-ethereum/releases/download/v5.2.0/geth-classic-win64-v5.2.0-480f90a.zip',
        },
      ],
      signatures: [
        {
          type: 'pgp',
          url: 'https://github.com/ethereumproject/go-ethereum/releases/download/v5.2.0/geth-classic-win64-v5.2.0-480f90a.zip.asc',
        },
      ],
    },
    {
      platform: 'linux',
      binaries: [
        {
          type: 'https',
          pack: 'zip',
          url: 'https://github.com/ethereumproject/go-ethereum/releases/download/v5.2.0/geth-classic-linux-v5.2.0-480f90a.zip',
        },
      ],
      signatures: [
        {
          type: 'pgp',
          url: 'https://github.com/ethereumproject/go-ethereum/releases/download/v5.2.0/geth-classic-linux-v5.2.0-480f90a.zip.asc',
        },
      ],
    },
  ],
};

module.exports = {
  DefaultGeth,
};
