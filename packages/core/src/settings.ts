import { TokenData } from './blockchains';

export interface SettingsOptions {
  [key: string]: boolean | number | string | null | undefined;
}

export interface SettingsStore {
  id: string;
  lastCursor?: number;
  options: SettingsOptions;
  terms: string;
  tokens: TokenData[];
  version: number;
  /**
   * @deprecated
   */
  chain?: unknown;
  /**
   * @deprecated
   */
  geth?: unknown;
}

export interface SettingsManager {
  getId(): string;
  getLastCursor(): number | undefined;
  getTokens(): TokenData[];
  setLastCursor(timestamp: number): ThisType<this>;
  setTerms(version: string): ThisType<this>;
  setTokens(tokens: TokenData[]): ThisType<this>;
  toJS(): SettingsStore;
  toJSON(): string;
}
