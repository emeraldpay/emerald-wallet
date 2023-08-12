import { config } from '@emeraldwallet/core';
import { Store } from 'redux';
import { Dispatcher } from './types';
import { IState, accounts, application, settings, tokens } from './index';

export enum TriggerStatus {
  CONTINUE,
  STOP,
}

export type TriggerProcess = (state: IState, dispatch: Dispatcher) => TriggerStatus;

/**
 * Trigger state value, which is any string representing the state. The trigger fires when the state value changes from
 * one to another.
 *
 * I.e. on a first run it can be "false". The trigger will continue to check on each state updates, and if at some
 * change it returns "true" then trigger fires. Then fires again when it changes back to "false", or to any other new
 * value.
 */
export type TriggerState = (state: IState) => string | undefined;

const handleTrigger = (store: Store<IState>, check: () => boolean, resolve: () => void): void => {
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

export function onceAccountsLoaded(store: Store<IState>): Promise<void> {
  return new Promise((resolve) => handleTrigger(store, () => !accounts.selectors.isLoading(store.getState()), resolve));
}

export function onceTokenBalancesLoaded(store: Store<IState>): Promise<void> {
  return new Promise((resolve) =>
    handleTrigger(store, () => tokens.selectors.isInitialized(store.getState()), resolve),
  );
}

export function onceModeSet(store: Store<IState>): Promise<void> {
  return new Promise((resolve) =>
    handleTrigger(
      store,
      () => {
        const { id, chains } = settings.selectors.getMode(store.getState());

        return id !== 'default' && chains.length > 0;
      },
      resolve,
    ),
  );
}

export function onceServicesStart(store: Store<IState>): Promise<void> {
  return new Promise((resolve) =>
    handleTrigger(store, () => application.selectors.terms(store.getState()) === config.TERMS_VERSION, resolve),
  );
}
