// @flow
import createLogger from '../../utils/logger';

const log = createLogger('api');

class NullConnect {
  connectEth(url) {
  }

  connectEthChain(name) {
  }

  connectEmerald() {
  }
}

export default class Api {
  constructor() {
    this.emerald = Api.getConnector().connectEmerald();
    // this.emerald = new Vault(new VaultInMemoryProvider());
    this.geth = null;
  }

  // DEPRECATED
  updateGethUrl(url) {
    if (!url) {
      log.warn('Disconnecting from Geth');
      this.geth = null;
      return;
    }
    this.geth = Api.getConnector().connectEth(url);
  }

  updateChain(name) {
    this.geth = Api.getConnector().connectEthChain(name);
  }

  static getConnector() {
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
}

export const api = new Api();
