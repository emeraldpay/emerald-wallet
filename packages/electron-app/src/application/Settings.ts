import ElectronStore from 'electron-store';
import { v4 as uuid } from 'uuid';

interface StoreType {
  id: string;
  lastCursor?: number;
  terms: string;
  version: number;
  // @deprecated
  chain?: any;
  // @deprecated
  geth?: any;
}

const DEFAULTS: StoreType = {
  id: uuid(),
  version: 1,
  terms: 'none',
};

export default class Settings {
  private settings: ElectronStore<StoreType>;

  constructor() {
    this.settings = new ElectronStore({
      defaults: DEFAULTS,
      name: 'settings',
    });

    // not used anymore
    this.settings.delete('geth');
    this.settings.delete('chain');
  }

  public getId(): string {
    return this.settings.get('id');
  }

  public getLastCursor(): number | undefined {
    return this.settings.get('lastCursor');
  }

  public setLastCursor(timestamp: number): Settings {
    this.settings.set('lastCursor', timestamp);

    return this;
  }

  public setTerms(version: string): Settings {
    this.settings.set('terms', version);

    return this;
  }

  public toJS(): StoreType {
    return this.settings.store;
  }
}
