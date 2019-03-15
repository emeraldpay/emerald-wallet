const { JsonRpcProvider, Vault} = require('@emeraldplatform/vault');
const { JsonRpc, HttpTransport } = require('@emeraldplatform/rpc');
const { EthRpc } = require('@emeraldplatform/eth-rpc');
const { app } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const os = require('os');
const log = require('./logger');
const { URL_FOR_CHAIN } = require('./utils');

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
    return new EthRpc(new JsonRpc(this.createHttpTransport(url)));
  }

  connectEthChain(name) {
    const chain = URL_FOR_CHAIN[name];
    if (!chain) {
      log.error('Unknown chain', name);
      return null;
    }
    return this.connectEth(chain.url);
  }

  connectEmerald() {
    return new Vault(
      new JsonRpcProvider(new JsonRpc(this.createHttpTransport('http://127.0.0.1:1920')))
    );
  }

  getUserAgent() {
    return this.headers['User-Agent'];
  }
}

module.exports = {
  ServerConnect,
};
