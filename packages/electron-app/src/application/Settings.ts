import * as ElectronStore from 'electron-store';

const uuid = require('uuid/v4');

interface IStoreType {
  version: number;
  terms: string;
  id: any;
  // @deprecated
  geth?: any;
  // @deprecated
  chain?: any;
}

const DEFAULTS: IStoreType = {
  version: 1,
  terms: 'none',
  id: uuid()
};

export default class Settings {
  private settings: ElectronStore<IStoreType>;
  constructor () {
    this.settings = new ElectronStore({
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
