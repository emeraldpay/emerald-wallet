import { EthRpc, JsonRpc, HttpTransport } from 'emerald-js';
import Vault from './vault';

export default class Api {
    constructor() {
        this.emerald = new Vault(new JsonRpc(new HttpTransport('http://127.0.0.1:1920')));
        this.geth = null;
    }

    updateGethUrl(url) {
        this.geth = new EthRpc(new JsonRpc(new HttpTransport(url)));
    }
}

export const api = new Api();

