const Store = require('electron-store');

const DEFAULTS = {
  version: 1,
  geth: {
    type: 'none',
    url: '',
  },
  chain: {
    name: null,
    id: null,
  },
  terms: 'none',
};

class Settings {
  constructor() {
    this.settings = new Store({
      name: 'settings',
      defaults: DEFAULTS,
    });
    // not used anymore
    this.settings.delete('geth');
  }

  /**
     * Get settings as plain JavaScript object
     * @returns {*}
     */
  toJS() {
    return this.settings.store;
  }

  getChain() {
    return this.settings.get('chain');
  }

  setChain(chain) {
    this.settings.set('chain', chain);
    return this;
  }

  setTerms(v) {
    this.settings.set('terms', v);
    return this;
  }
}

module.exports = Settings;
