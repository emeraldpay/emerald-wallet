export interface SettingsStore {
  id: string;
  lastCursor?: number;
  terms: string;
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
  setLastCursor(timestamp: number): ThisType<this>;
  setTerms(version: string): ThisType<this>;
  toJS(): SettingsStore;
}
