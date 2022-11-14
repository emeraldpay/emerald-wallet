import { SettingsManager, SettingsStore } from '@emeraldwallet/core';
import ElectronStore from 'electron-store';
import { v4 as uuid } from 'uuid';

const DEFAULTS: SettingsStore = {
  id: uuid(),
  version: 1,
  terms: 'none',
};

export default class Settings implements SettingsManager {
  private settings: ElectronStore<SettingsStore>;

  constructor() {
    this.settings = new ElectronStore({
      defaults: DEFAULTS,
      name: 'settings',
    });

    // not used anymore
    this.settings.delete('geth');
    this.settings.delete('chain');
  }

  getId(): string {
    return this.settings.get('id');
  }

  getLastCursor(): number | undefined {
    return this.settings.get('lastCursor');
  }

  setLastCursor(timestamp: number): Settings {
    this.settings.set('lastCursor', timestamp);

    return this;
  }

  setTerms(version: string): Settings {
    this.settings.set('terms', version);

    return this;
  }

  toJS(): SettingsStore {
    return this.settings.store;
  }
}
