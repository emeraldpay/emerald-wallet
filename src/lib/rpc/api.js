// @flow
import { EthRpc, JsonRpc, HttpTransport, Vault, VaultJsonRpcProvider, VaultInMemoryProvider } from 'emerald-js';

export default class Api {
    emerald: Vault;

    constructor() {
      this.emerald = new Vault(
        new VaultJsonRpcProvider(
          new JsonRpc(
            new HttpTransport('http://127.0.0.1:1920'))));
      // this.emerald = new Vault(new VaultInMemoryProvider());
      this.geth = null;
    }

    updateGethUrl(url) {
      this.geth = new EthRpc(new JsonRpc(new HttpTransport(url)));
    }
}

export const api = new Api();

