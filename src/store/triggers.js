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
    const { terms, geth, connector } = store.getState().launcher.toJS();
    return terms === 'v1' && geth.status === 'ready' && connector.status === 'ready';
  };

  return new Promise((resolve, reject) => handleTrigger(check, resolve, store));
}

export function onceHasAccountsWithBalances(store) {
  const check = () => {
    const { accounts } = store.getState();
    const allAccounts = accounts.get('accounts');
    const eachHasBalance = allAccounts.reduce((memo, account) => memo && account.get('balance') !== null, true);
    return allAccounts.size > 0 && eachHasBalance;
  };

  return new Promise((resolve, reject) => handleTrigger(check, resolve, store));
}

export function onceAccountsLoaded(store) {
  const check = () => {
    const { accounts } = store.getState();
    return accounts.get('loading') === false;
  };

  return new Promise((resolve, reject) => handleTrigger(check, resolve, store));
}

export function onceAnyServiceDead(store) {
  const check = () => {
    const { terms, geth, connector } = store.getState().launcher.toJS();
    return geth.status !== 'ready' || connector.status !== 'ready';
  };

  return new Promise((resolve, reject) => handleTrigger(check, resolve, store));
}

export function onceServicesRestart(store) {
  const check = () => {
    const { terms, geth, connector } = store.getState().launcher.toJS();
    return geth.status !== 'ready' || connector.status !== 'ready';
  };

  return new Promise((resolve, reject) => handleTrigger(check, resolve, store));
}
