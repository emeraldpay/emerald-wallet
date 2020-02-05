import { Logger } from '@emeraldwallet/core';
import { Vault } from '@emeraldwallet/vault/lib/Vault';

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

export function getRemoteVault() {
  // TODO workaround for testing, should be properly mocked
  if (typeof global.require !== 'function') {
    throw new Error('Electron Remote is not available');
  }
  const { remote } = global.require('electron');
  // TODO workaround for testing, should be properly mocked
  if (typeof remote !== 'object' || typeof remote.getGlobal !== 'function') {
    throw new Error('Electron Remote is not available');
  }

  const remoteVault = remote.getGlobal('vault');
  // Wrap remote vault provider into object in renderer process
  return new Vault(remoteVault.provider);
}

export class Api {
  constructor(connector, vault) {
    this.connector = connector;
    this.vault = vault;
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
