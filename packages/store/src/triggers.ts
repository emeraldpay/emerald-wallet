import {blockchains, accounts, application, settings, hwkey, IState} from './index';
import {TERMS_VERSION} from './config';
import {Dispatch, Store} from "redux";
import {LedgerApp} from "@emeraldpay/emerald-vault-core";
import {IHWKeyState} from "./hwkey/types";

/**
 * Trigger state value, which is any string representing the state. The trigger fires when the the state value changes
 * from one to another.
 *
 * I.e. on a first run it can be "false". The trigger will continue to check on each state updates, and if at some change
 * it returns "true" then trigger fires. Then fires again when it changes back to "false", or to any other new value.
 */
export type TriggerState = (state: IState) => string | undefined;

/**
 * Process trigger event
 * @return status (continue or stop)
 */
export type TriggerProcess = (state: IState, dispatch: Dispatch) => TriggerStatus;

export enum TriggerStatus {
  CONTINUE,
  STOP
}

const handleTrigger = (check: () => boolean, resolve: () => void, store: Store<IState>) => {
  // check once with current state.
  //   Avoids having to wait for next state update.
  //   Makes the speed more consistent.
  if (check()) {
    resolve();
    return;
  }

  const unsubscribe = store.subscribe(() => {
    if (check()) {
      unsubscribe();
      resolve();
    }
  });
};

export function onceServicesStart(store: Store<IState>) {
  const check = () => {
    const terms = application.selectors.terms(store.getState());
    return terms === TERMS_VERSION;
  };

  return new Promise((resolve, reject) => handleTrigger(check, resolve, store));
}

export function onceModeSet(store: Store<IState>) {
  const check = () => {
    const mode = settings.selectors.mode(store.getState());
    const {id, chains} = mode;
    return id !== 'default' && chains.length > 0;
  };

  return new Promise((resolve) => handleTrigger(check, resolve, store));
}

export function onceAccountsLoaded(store: Store<IState>) {
  const check = () => {
    return !accounts.selectors.isLoading(store.getState());
  };

  return new Promise((resolve) => handleTrigger(check, resolve, store));
}

export function onceBlockchainConnected(store: Store<IState>) {
  const check = () => {
    return blockchains.selectors.hasAny(store.getState());
  };

  return new Promise((resolve) => handleTrigger(check, resolve, store));
}

export class Triggers {
  private store?: Store<IState>;

  setStore(store: Store) {
    this.store = store;
  }

  add(check: TriggerState, handler: TriggerProcess) {
    if (this.store) {
      let last: string | undefined = undefined;
      let unsubscribe = this.store.subscribe(() => {
        const state = this.store!.getState();
        const current = check(state);
        const triggered = (typeof last == "undefined" && typeof current != "undefined") || (typeof last == "string" && last != current);
        last = current;
        if (triggered) {
          const status = handler(state, this.store!.dispatch);
          if (status == TriggerStatus.STOP) {
            unsubscribe();
          }
        }
      });
    } else {
      console.warn("Store is not ready for triggers");
    }
  }

  schedule(period: number, handler: TriggerProcess) {
    const self = this;
    const execute = () => {
      const state = this.store?.getState();
      const dispatch = this.store?.dispatch;
      let status = TriggerStatus.CONTINUE;
      if (typeof state != "undefined" && typeof dispatch != "undefined") {
        status = handler(state, dispatch);
      }
      if (status == TriggerStatus.CONTINUE) {
        setTimeout(execute.bind(self), period)
      }
    };
    setTimeout(execute.bind(self), period);
  }

}