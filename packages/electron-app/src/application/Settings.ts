import { SettingsManager, SettingsOptions, SettingsStore, TokenData } from '@emeraldwallet/core';
import ElectronStore from 'electron-store';
import { v4 as uuid } from 'uuid';

const DEFAULTS: SettingsStore = {
  id: uuid(),
  options: {},
  version: 1,
  terms: 'none',
  tokens: [],
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

  getTokens(): TokenData[] {
    return this.settings.get('tokens');
  }

  setLastCursor(timestamp: number): Settings {
    this.settings.set('lastCursor', timestamp);

    return this;
  }

  setOptions(options: SettingsOptions): Settings {
    this.settings.set('options', options);

    return this;
  }

  setTerms(version: string): Settings {
    this.settings.set('terms', version);

    return this;
  }

  setTokens(tokens: TokenData[]): Settings {
    this.settings.set('tokens', tokens);

    return this;
  }

  toJS(): SettingsStore {
    return this.settings.store;
  }

  toJSON(): string {
    return JSON.stringify(this.settings.store);
  }
}
