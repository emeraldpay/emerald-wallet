import {BlockchainCode} from '@emeraldwallet/core';

class NullConnect {
  connectEthChain(name) {
  }

  connectEmerald() {
  }
}


export function getConnector() {
  // TODO workaround for testing, should be properly mocked
  if (typeof global.require !== 'function') {
    console.warn('Electron Remote is not available');
    return new NullConnect();
  }
  const { remote } = global.require('electron');
  // TODO workaround for testing, should be properly mocked
  if (typeof remote !== 'object' || typeof remote.getGlobal !== 'function') {
    console.warn('Electron Remote is not available');
    return new NullConnect();
  }
  return remote.getGlobal('serverConnect');
}


export class Api {
  constructor(connector, chains) {
    this.emerald = connector.connectEmerald();
    this.chains = new Map();
    chains.forEach((c) => {
      this.chains.set(c, connector.connectEthChain(c));
    });
  }

  chain(code) {
    return this.chains.get(code);
  }
}
