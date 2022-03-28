import {TxHistory} from "./txhistory";

const addon = require('../index.node');

export type Status<T> = {
  succeeded: boolean,
  result: T | undefined,
  error: {
    code: number,
    message: string
  } | undefined
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

