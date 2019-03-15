// @flow

export default class Api {
  constructor() {
    this.emerald = Api.getConnector().connectEmerald();
    // this.emerald = new Vault(new VaultInMemoryProvider());
    this.geth = null;
  }

  updateGethUrl(url) {
    this.geth = Api.getConnector().connectEth(url);
  }

  static getConnector() {
    const { remote } = global.require('electron');
    return remote.getGlobal('serverConnect');
  }
}

export const api = new Api();
