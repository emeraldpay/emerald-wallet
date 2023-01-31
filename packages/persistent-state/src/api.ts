import { PersistentState as PersistentStateBase } from '@emeraldwallet/core';
import { Addressbook } from './addressbook';
import { TxHistory } from './txhistory';
import { TxMeta } from './txmeta';
import { XPubPosition } from './xpubpos';
import {Balances} from "./balance";

export type StatusOk<T> = {
  succeeded: true;
  result: T | undefined;
};

export type StatusFail = {
  error: {
    code: number;
    message: string;
  };
  succeeded: false;
};

export type Status<T> = StatusOk<T> | StatusFail;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonReviver = (key: string, value: any) => any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function recursiveDateFormatter(value: Record<string, any>, selectors: string[]): Record<string, any> | Date {
  const [selector, ...restSelectors] = selectors;

  if (restSelectors.length === 0) {
    if (typeof value[selector] === 'string') {
      return {
        ...value,
        [selector]: new Date(value[selector]),
      };
    }
  } else {
    return {
      ...value,
      [selector]: recursiveDateFormatter(value[selector], restSelectors),
    };
  }

  return value;
}

export function createDateReviver(names: string[]): JsonReviver {
  return (key: string, value: string | Record<string, unknown>) => {
    const selectors = names.reduce<Record<string, string[]>>((carry, name) => {
      const [part, ...parts] = name.split('.');

      return { ...carry, [part]: parts };
    }, {});

    if (selectors[key]?.length === 0 && typeof value === 'string') {
      return new Date(value);
    } else if (selectors[key]?.length > 0 && typeof value === 'object') {
      return recursiveDateFormatter(value, selectors[key]);
    }

    return value;
  };
}

export class PersistentStateManager implements PersistentStateBase.PersistentState {
  /**
   * Mapping to the Rust module through NAPI.
   *
   * **Internal. Do not use directly.**
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly addon: any;

  readonly addressbook: PersistentStateBase.Addressbook = new Addressbook(this);
  readonly txhistory: PersistentStateBase.TxHistory = new TxHistory(this);
  readonly txmeta: PersistentStateBase.TxMeta = new TxMeta(this);
  readonly xpubpos: PersistentStateBase.XPubPosition = new XPubPosition(this);
  readonly balances: PersistentStateBase.Balances = new Balances(this);

  /**
   * Initialize the cache keeping the stored data at the specified dir.
   *
   * **Must be only one instance, because all of them use the same dir once created**
   */
  constructor(dir?: string) {
    this.addon = require('../index.node');
    this.addon.open(dir);
  }

  /**
   * Call _before_ existing the application, otherwise some data may be lost.
   */
  close(): void {
    this.addon.close();
  }
}
