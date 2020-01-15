import { Logger } from '@emeraldwallet/core';

const log = Logger.forCategory('api');

class NullConnect {
  connectEthChain(name) {
  }
}


export function getConnector() {
  // TODO workaround for testing, should be properly mocked
  if (typeof global.require !== 'function') {
    log.warn('Electron Remote is not available');
    return new NullConnect();
  }
  const { remote } = global.require('electron');
  // TODO workaround for testing, should be properly mocked
  if (typeof remote !== 'object' || typeof remote.getGlobal !== 'function') {
    log.warn('Electron Remote is not available');
    return new NullConnect();
  }
  return remote.getGlobal('serverConnect');
}


export class Api {
  constructor(connector) {
    this.connector = connector;
    this.vault = connector.getVault();
    this.chains = new Map();
  }

  connectChains(chains) {
    chains.forEach((c) => {
      if (!this.chains.has(c.toLowerCase())) {
        log.info(`Setting up connection to ${c}`);
        this.chains.set(c.toLowerCase(), this.connector.connectEthChain(c));
      }
    });
  }

  chain(code) {
    code = code.toLowerCase();
    if (!this.chains.has(code)) {
      throw new Error(`Unsupported chain: ${code}`);
    }
    return this.chains.get(code);
  }
}
