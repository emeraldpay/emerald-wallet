import { amountFactory, blockchainIdToCode, PersistentState } from '@emeraldwallet/core';
import { Direction } from '@emeraldwallet/core/lib/persisistentState';
import { AddressbookImpl } from './addressbook';
import { TxHistoryImpl } from './txhistory';
import { XPubPositionImpl } from './xpubpos';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const addon = require('../index.node');

export type StatusOk<T> = {
  succeeded: true;
  result: T | undefined;
};

export type StatusFail = {
  succeeded: false;
  error: {
    code: number;
    message: string;
  };
};

export type Status<T> = StatusOk<T> | StatusFail;

type PromiseCallback<T> = (value?: T) => void;
// Neon Callback for Status<T>
type NeonCallback<T> = (status: any) => void;

type JsonReviver = (key: string, value: any) => any;
type PostProcess<T> = (data?: T) => T | undefined;

function resolveStatus<T>(
  status: Status<T>,
  resolve: PromiseCallback<T>,
  reject: PromiseCallback<Error>,
  postProcess?: PostProcess<T>,
): void {
  if (!status.succeeded) {
    return reject(new Error(status.error?.message ?? 'State Manager Error'));
  }
  resolve(postProcess?.(status.result) ?? status.result);
}

export function createDateReviver(names: string[]): JsonReviver {
  return (key: string, value: any) => {
    if (typeof value == 'string' && names.indexOf(key) >= 0) {
      return new Date(value);
    }
    return value;
  };
}

export const postProcessAmountField: PostProcess<PersistentState.PageResult<PersistentState.Transaction>> = (data) => {
  if (data == null) {
    return data;
  }

  return {
    ...data,
    items: data.items.map((item) => {
      const factory = amountFactory(blockchainIdToCode(item.blockchain));

      return {
        ...item,
        changes: item.changes.map((change) => {
          const amountValue = factory(change.amount);

          return {
            ...change,
            amountValue,
            direction: amountValue.isPositive() ? Direction.EARN : Direction.SPEND,
          };
        }),
      };
    }),
  };
};

export function neonToPromise<T>(
  resolve: PromiseCallback<T>,
  reject: PromiseCallback<Error>,
  reviver?: JsonReviver,
  postProcess?: PostProcess<T>,
): NeonCallback<T> {
  return (status) => resolveStatus(JSON.parse(status ?? '{"succeeded": false}', reviver), resolve, reject, postProcess);
}

export class PersistentStateImpl implements PersistentState.PersistentState {
  /**
   * Mapping to the Rust module through NAPI
   * Internal. Do not use directly.
   */
  addon = addon;

  readonly txhistory: PersistentState.TxHistory = new TxHistoryImpl(this);

  readonly addressbook: PersistentState.Addressbook = new AddressbookImpl(this);

  readonly xpubpos: PersistentState.XPubPosition = new XPubPositionImpl(this);

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
    this.addon.open(dir ?? './state_test');
  }

  /**
   * Call _before_ existing the application, otherwise some data may be lost.
   */
  close(): void {
    this.addon.close();
  }
}
