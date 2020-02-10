const Store = require('electron-store');
const uuid = require('uuid/v4');

const DEFAULTS = {
  version: 1,
  terms: 'none',
  id: uuid()
};

export default class Settings {
  private settings: any;
  constructor () {
    this.settings = new Store({
      name: 'settings',
      defaults: DEFAULTS
    });
    // not used anymore
    this.settings.delete('geth');
    this.settings.delete('chain');
  }

  /**
   * Get settings as plain JavaScript object
   * @returns {*}
   */
  public toJS () {
    return this.settings.store;
  }

  public setTerms (v: string) {
    this.settings.set('terms', v);
    return this;
  }

  public getId () {
    return this.settings.get('id');
  }
}
