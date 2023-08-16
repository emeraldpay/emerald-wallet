import { BackendApi, WalletApi, blockchainIdToCode } from '@emeraldwallet/core';
import { IState, accounts, allowances, tokens } from '@emeraldwallet/store';
import { Action, Store } from 'redux';

export function initAllowancesState(api: WalletApi, backendApi: BackendApi, store: Store<IState>): void {
  const state = store.getState();

  const wallets = accounts.selectors.allWallets(state);

  wallets.forEach(({ entries, id: walletId }) =>
    api.allowances.list(walletId).then(({ items }) =>
      items.forEach(({ amount, blockchain, owner, spender, token }) => {
        const entry = entries.find(
          ({ blockchain: entryBlockchain }) => blockchainIdToCode(entryBlockchain) === blockchain,
        );

        if (entry != null) {
          const { address } = entry;

          if (address != null) {
            const available = tokens.selectors.selectBalance(state, blockchain, owner, token)?.number.toString() ?? '0';

            store.dispatch(
              allowances.actions.initAddressAllowance({
                available,
                blockchain,
                address: address.value,
                allowance: amount,
                contractAddress: token,
                ownerAddress: owner,
                spenderAddress: spender,
              }) as unknown as Action,
            );
          }
        }
      }),
    ),
  );
}
