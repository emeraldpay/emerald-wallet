const { JsonRpcProvider, Vault} = require('@emeraldplatform/vault');
const {
  DefaultJsonRpc, HttpTransport, RevalidatingJsonRpc, VerifyingJsonRpc, RotatingJsonRpc,
} = require('@emeraldplatform/rpc');
const {
  EthRpc, VerifyMinPeers, VerifyNotSyncing, VerifyGenesis, VerifyBlockHash,
} = require('@emeraldplatform/eth-rpc');
const { app } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const os = require('os');
const log = require('./logger');
const { URL_FOR_CHAIN } = require('./utils');

const CHAIN_VERIFY = {
  mainnet: [
    new VerifyMinPeers(3),
    new VerifyNotSyncing(),
    new VerifyGenesis('0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3'),
    new VerifyBlockHash(1920000, '0x94365e3a8c0b35089c1d1195081fe7489b528a84b22199c916180db8b28ade7f'),
  ],
  eth: [
    new VerifyMinPeers(3),
    new VerifyNotSyncing(),
    new VerifyGenesis('0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3'),
    new VerifyBlockHash(1920000, '0x4985f5ca3d2afbec36529aa96f74de3cc10a2a4a6c44f2157a57d2c6059a11bb '),
  ],
  morden: [
    new VerifyMinPeers(1),
    new VerifyNotSyncing(),
    new VerifyGenesis('0x0cd786a2425d16f152c658316c423e6ce1181e15c3295826d7c9904cba9ce303'),
  ],
};

class ServerConnect {
  constructor() {
    this.headers = {
      'User-Agent': `EmeraldWallet/${app.getVersion()}`,
    };
  }

  init() {
    const details = [os.platform(), os.release(), os.arch(), app.getLocale()].join('; ');
    this.headers['User-Agent'] = `Electron/${process.versions.electron} (${details}) EmeraldWallet/${app.getVersion()} (+https://emeraldwallet.io) Chrome/${process.versions.chrome} node-fetch/1.0`;
  }

  createHttpTransport(url) {
    return new HttpTransport(url, this.headers);
  }

  // DEPRECATED
  connectEth(url) {
    if (!url) {
      log.error('Empty JSON RPC URL is provided');
      return null;
    }
    const chain = Object.entries(URL_FOR_CHAIN).find((entry) => entry[1].url === url);
    if (!chain) {
      log.error('Unsupported JSON RPC URL is provided');
      return null;
    }
    return this.connectEthChain(chain[0]);
  }

  connectEthChain(name) {
    const chain = URL_FOR_CHAIN[name];
    if (!chain) {
      log.error('Unknown chain', name);
      return null;
    }
    const verifiers = CHAIN_VERIFY[name];
    if (typeof verifiers === 'undefined') {
      log.error('No verifiers for chain', name);
      return null;
    }
    const local = new VerifyingJsonRpc(new DefaultJsonRpc(new HttpTransport('http://127.0.0.1:8545')));
    verifiers.forEach((v) => local.verifyWith(v));
    const localRevalidate = new RevalidatingJsonRpc(15000, local);
    if (typeof this.revalidate !== 'undefined') {
      this.revalidate.stop();
    }
    this.revalidate = localRevalidate;
    localRevalidate.listener = (status) => {
      log.info(`Local Node Available: ${status}`);
    };
    localRevalidate.revalidate()
      .then(() => log.info('Verified local node'))
      .catch(() => log.info('Failed to verify local node'));
    localRevalidate.start();

    return new EthRpc(
      new RotatingJsonRpc(localRevalidate, new DefaultJsonRpc(this.createHttpTransport(chain.url)))
    );
  }

  connectEmerald() {
    return new Vault(
      new JsonRpcProvider(new DefaultJsonRpc(new HttpTransport('http://127.0.0.1:1920')))
    );
  }

  getUserAgent() {
    return this.headers['User-Agent'];
  }
}

module.exports = {
  ServerConnect,
};
