const Store = require('electron-store');
const uuid = require('uuid/v4');
const { URL_FOR_CHAIN } = require('./utils');

const DEFAULTS = {
  version: 1,
  terms: 'none',
  id: uuid(),
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

  setChain(chain) {
    this.settings.set('chain', chain);
    return this;
  }

  setTerms(v) {
    this.settings.set('terms', v);
    return this;
  }

  getId() {
    return this.settings.get('id');
  }
}

module.exports = Settings;
