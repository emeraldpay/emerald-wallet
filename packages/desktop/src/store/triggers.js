import { blockchains } from '@emeraldwallet/store';
import { TERMS_VERSION } from './config';
import { addresses } from '.';

const handleTrigger = (check, resolve, store) => {
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

export function onceServicesStart(store) {
  const check = () => {
    const { terms, connector } = store.getState().launcher.toJS();
    return terms === TERMS_VERSION;
  };

  return new Promise((resolve, reject) => handleTrigger(check, resolve, store));
}

export function onceModeSet(store) {
  const check = () => {
    const mode = store.getState().wallet.settings.get('mode');
    const { id, chains } = mode.toJS();
    return id !== 'default' && chains.length > 0;
  };

  return new Promise((resolve, reject) => handleTrigger(check, resolve, store));
}

export function onceBalancesSet(store) {
  const check = () => {
    const allAccounts = addresses.selectors.all(store.getState());
    const eachHasBalance = allAccounts.reduce((memo, account) => memo && account.get('balance') !== null, true);
    return allAccounts.size > 0 && eachHasBalance;
  };

  return new Promise((resolve, reject) => handleTrigger(check, resolve, store));
}

export function onceAccountsLoaded(store) {
  const check = () => {
    return addresses.selectors.isLoading(store.getState()) === false;
  };

  return new Promise((resolve, reject) => handleTrigger(check, resolve, store));
}

export function onceBlockchainConnected(store) {
  const check = () => {
    return blockchains.selectors.hasAny(store.getState());
  };

  return new Promise((resolve, reject) => handleTrigger(check, resolve, store));
}
