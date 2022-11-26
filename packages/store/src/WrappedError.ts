import { PersistentState } from '@emeraldwallet/core';
import { StoredTransaction } from './txhistory/types';

const { State } = PersistentState;

export class WrappedError extends Error {
  static errorRegex = /^(?:Error invoking remote method '([^']+)':\s+)?(?:Error:\s+)?(?:[^\s_]+_ERROR:\s+)?(.+)$/;

  readonly ipcChannel?: string;
  readonly originalMessage: string;

  constructor(error: Error | string, transaction?: StoredTransaction) {
    const isErrorInstance = error instanceof Error;
    const errorMessage = isErrorInstance ? error.message : error;

    const [, ipcChannel, unwrappedMessage] = errorMessage.match(WrappedError.errorRegex) ?? [];

    switch (unwrappedMessage) {
      case 'nonce too low':
        super(`Transaction ${transaction?.state === State.CONFIRMED ? 'already confirmed' : unwrappedMessage}`);
        break;
      case 'could not replace existing tx':
        super('Could not replace existing transaction, check gas price and try again');
        break;
      default:
        super(unwrappedMessage);
    }

    this.ipcChannel = ipcChannel;
    this.originalMessage = errorMessage;

    if (isErrorInstance) {
      this.stack = error.stack;
    }
  }
}
