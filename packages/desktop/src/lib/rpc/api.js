// @flow
import createLogger from '../../utils/logger';

const log = createLogger('api');

export default class Api {
  constructor() {
    this.emerald = Api.getConnector().connectEmerald();
    // this.emerald = new Vault(new VaultInMemoryProvider());
    this.geth = null;
  }

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
    const { remote } = global.require('electron');
    return remote.getGlobal('serverConnect');
  }
}

export const api = new Api();
