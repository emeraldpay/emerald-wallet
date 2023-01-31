import { neonFrameHandlerCall } from '@emeraldpay/neon-frame';
import { PersistentState } from '@emeraldwallet/core';
import {createDateReviver, PersistentStateManager} from './api';

export class Balances implements PersistentState.Balances {
  private manager: PersistentStateManager;
  constructor(manager: PersistentStateManager) {
    this.manager = manager;
  }
  list(address: PersistentState.Address | PersistentState.XPub): Promise<PersistentState.Balance[]> {
    return neonFrameHandlerCall(
      this.manager.addon,
      'balance_list',
      [address],
      createDateReviver(['timestamp']),
    );
  }
  set(balance: PersistentState.Balance): Promise<boolean> {
    return neonFrameHandlerCall(this.manager.addon, 'balance_set', [JSON.stringify(balance)]);
  }

}
