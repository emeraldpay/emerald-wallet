import {Transaction, TxHistory} from "./txhistory";
import {Addressbook} from "./addressbook";
import {XPubPosition} from "./xpubpos";

const addon = require('../index.node');

export type StatusOk<T> = {
  succeeded: true,
  result: T | undefined,
}

export type StatusFail = {
  succeeded: false,
  error: {
    code: number,
    message: string
  }
}

export type Status<T> = StatusOk<T> | StatusFail;

export interface PageResult<T> {
  items: T[],
  cursor?: number,
}


type PromiseCallback<T> = (value?: T) => void;
// Neon Callback for Status<T>
type NeonCallback<T> = (status: any) => void;

type JsonReviver = (this: any, key: string, value: any) => any;

function resolveStatus<T>(status: Status<T>, resolve: PromiseCallback<T>, reject: PromiseCallback<Error>) {
  if (!status.succeeded) {
    return reject(new Error(status.error?.message || "State Manager Error"));
  }
  resolve(status.result);
}

export function createDateReviver(names: string[]): JsonReviver {
  return function (this: any, key: string, value: any) {
    if (typeof value == "string" && names.indexOf(key) >= 0) {
      return new Date(value)
    }
    return value
  }
}

export function neonToPromise<T>(resolve: PromiseCallback<T>, reject: PromiseCallback<Error>, reviver?: JsonReviver): NeonCallback<T> {
  return (status) => resolveStatus(JSON.parse(status || "{\"succeeded\": false}", reviver), resolve, reject)
}

export class EmeraldStateManager {

  /**
   * Mapping to the Rust module through NAPI
   * Internal. Do not use directly.
   */
  addon = addon;

  /**
   * Manage Transaction History
   */
  readonly txhistory = new TxHistory(this);
  /**
   * Manager Address Book
   */
  readonly addressbook = new Addressbook(this);

  /**
   * Manage XPub position
   */
  readonly xpubpos = new XPubPosition(this);

  /**
   * Initialize the cache keeping the stored data at the specified dir.
   *
   * !!!!!
   * MUST BE ONLY ONE INSTANCE, BECAUSE ALL OF THEM USE THE SAME DIR ONCE CREATED
   * !!!!!
   *
   * @param dir
   */
  constructor(dir?: string) {
    this.addon.open(dir || "./state_test")
  }

  close() {
    this.addon.close();
  }

}

