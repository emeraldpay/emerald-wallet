import {BlockchainCode} from '@emeraldwallet/core';

class NullConnect {
  connectEthChain(name) {
  }

  connectEmerald() {
  }
}


function getConnector() {
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

  constructor(connector) {
    this.emerald = connector.connectEmerald();
    this.chains = {};
    this.chains[BlockchainCode.ETC] = connector.connectEthChain(BlockchainCode.ETC);
    this.chains[BlockchainCode.ETH] = connector.connectEthChain(BlockchainCode.ETH);
  }

  chain(code) {
    return this.chains[code];
  }
}


export const api = new Api(getConnector());
