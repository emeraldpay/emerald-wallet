const Store = require('electron-store');
const uuid = require('uuid/v4');

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
    this.settings.delete('chain');
  }

  /**
     * Get settings as plain JavaScript object
     * @returns {*}
     */
  toJS() {
    return this.settings.store;
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
