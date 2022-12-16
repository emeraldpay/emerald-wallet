import { Store } from 'redux';
import { TERMS_VERSION } from './config';
import { Dispatcher } from './types';
import { IState, accounts, application, blockchains, settings } from './index';

/**
 * Trigger state value, which is any string representing the state. The trigger fires when the state value changes from
 * one to another.
 *
 * I.e. on a first run it can be "false". The trigger will continue to check on each state updates, and if at some
 * change it returns "true" then trigger fires. Then fires again when it changes back to "false", or to any other new
 * value.
 */
export type TriggerState = (state: IState) => string | undefined;

/**
 * Process trigger event
 *
 * @return status (continue or stop)
 */
export type TriggerProcess = (state: IState, dispatch: Dispatcher) => TriggerStatus;

export enum TriggerStatus {
  CONTINUE,
  STOP,
}

const handleTrigger = (check: () => boolean, resolve: () => void, store: Store<IState>): void => {
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

export function onceServicesStart(store: Store<IState>): Promise<void> {
  return new Promise((resolve) =>
    handleTrigger(
      () => {
        const terms = application.selectors.terms(store.getState());
        return terms === TERMS_VERSION;
      },
      resolve,
      store,
    ),
  );
}

export function onceModeSet(store: Store<IState>): Promise<void> {
  return new Promise((resolve) =>
    handleTrigger(
      () => {
        const mode = settings.selectors.getMode(store.getState());

        const { id, chains } = mode;

        return id !== 'default' && chains.length > 0;
      },
      resolve,
      store,
    ),
  );
}

export function onceAccountsLoaded(store: Store<IState>): Promise<void> {
  return new Promise((resolve) => handleTrigger(() => !accounts.selectors.isLoading(store.getState()), resolve, store));
}

export function onceBlockchainConnected(store: Store<IState>): Promise<void> {
  return new Promise((resolve) => handleTrigger(() => blockchains.selectors.hasAny(store.getState()), resolve, store));
}

export class Triggers {
  private store?: Store<IState>;

  setStore(store: Store): void {
    this.store = store;
  }

  add(check: TriggerState, handler: TriggerProcess): void {
    if (this.store) {
      let last: string | undefined = undefined;

      const unsubscribe = this.store.subscribe(() => {
        const { dispatch } = this.store ?? {};

        const state = this.store?.getState();

        if (dispatch != null && state != null) {
          const current = check(state);

          last = current;

          if ((last == null && current != null) || (typeof last == 'string' && last !== current)) {
            const status = handler(state, dispatch);

            if (status == TriggerStatus.STOP) {
              unsubscribe();
            }
          }
        }
      });
    } else {
      console.warn('Store is not ready for triggers');
    }
  }

  schedule(period: number, handler: TriggerProcess): void {
    const execute = (): void => {
      const { dispatch } = this.store ?? {};

      const state = this.store?.getState();

      let status = TriggerStatus.CONTINUE;

      if (dispatch != null && state != null) {
        status = handler(state, dispatch);
      }

      if (status == TriggerStatus.CONTINUE) {
        setTimeout(execute, period);
      }
    };

    setTimeout(execute, period);
  }
}
