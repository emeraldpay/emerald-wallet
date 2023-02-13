import { WalletEntry, isBitcoinEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { Coin, PersistentState, WalletApi } from '@emeraldwallet/core';
import { IState, accounts, tokens } from '@emeraldwallet/store';
import { Store } from 'redux';

type Balances = {
  coinBalances: PersistentState.Balance[];
  tokenBalances: PersistentState.Balance[];
};

export function initBalancesState(api: WalletApi, store: Store<IState>): void {
  const entries = accounts.selectors.allEntries(store.getState());

  const entryByIdentifier = entries.reduce((carry, entry) => {
    if (isEthereumEntry(entry)) {
      const { address } = entry;

      if (address != null) {
        const list = carry.get(address.value) ?? [];

        return carry.set(address.value, [...list, entry]);
      }
    }

    if (isBitcoinEntry(entry)) {
      return entry.xpub.reduce<typeof carry>((xPubCarry, { xpub }) => {
        const list = xPubCarry.get(xpub) ?? [];

        return xPubCarry.set(xpub, [...list, entry]);
      }, carry);
    }

    return carry;
  }, new Map<string, WalletEntry[]>());

  Promise.all(
    [...entryByIdentifier.keys()].map(
      async (identifier) => ({ identifier, balances: await api.balances.list(identifier) }),
      {},
    ),
  ).then((balances) => {
    const balanceByIdentifier = balances.reduce<Record<string, PersistentState.Balance[]>>(
      (carry, { identifier, balances }) => ({ ...carry, [identifier]: balances }),
      {},
    );

    const { coinBalances, tokenBalances } = Object.values(balanceByIdentifier)
      .flat()
      .reduce<Balances>(
        (carry, balance) => {
          if (balance.asset in Coin) {
            return { ...carry, coinBalances: [...carry.coinBalances, balance] };
          }

          return { ...carry, tokenBalances: [...carry.tokenBalances, balance] };
        },
        { coinBalances: [], tokenBalances: [] },
      );

    const entryByAddress = Object.entries(balanceByIdentifier).reduce<Record<string, WalletEntry[]>>(
      (carry, [identifier, balances]) => {
        return balances.reduce(
          (balancesCarry, balance) => ({ ...balancesCarry, [balance.address]: entryByIdentifier.get(identifier) }),
          carry,
        );
      },
      {},
    );

    store.dispatch(accounts.actions.initState(coinBalances, entryByAddress));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.dispatch(tokens.actions.initState(tokenBalances) as any);
  });
}
