import JsonRpc from './jsonRpc';
import Geth from './geth';
import Emerald from './emerald';

export default class Api {
    constructor() {
        this.emerald = new Emerald(new JsonRpc('http://127.0.0.1:1920'));
        this.geth = null;
    }

    updateGethUrl(url) {
        this.geth = new Geth(new JsonRpc(url));
    }
}

export const api = new Api();

