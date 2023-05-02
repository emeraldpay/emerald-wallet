import { EntryId, Uuid, Wallet } from '@emeraldpay/emerald-vault-core';
import { amountFactory, blockchainIdToCode } from '@emeraldwallet/core';
import produce from 'immer';
import {
  AccountDetails,
  AccountsAction,
  ActionTypes,
  IAccountsState,
  IHdAccountCreated,
  ISetBalanceAction,
  ISetLoadingAction,
  ISetSeedsAction,
  ISetTxCountAction,
  IUpdateWalletAction,
  IWalletCreatedAction,
  IWalletsLoaded,
  InitAccountStateAction,
  SetWalletIconsAction,
} from './types';

type Updater<T> = (source: T) => T;

export const INITIAL_STATE: IAccountsState = {
  details: [],
  icons: {},
  loading: true,
  seeds: [],
  wallets: [],
};

function onInitState(state: IAccountsState, { balances, entriesByAddress }: InitAccountStateAction): IAccountsState {
  return {
    ...state,
    details: [
      ...state.details,
      ...balances.reduce<AccountDetails[]>((carry, { address, amount, blockchain, utxo }) => {
        const index = state.details.findIndex((item) => item.address === address);

        if (index > -1) {
          return carry;
        }

        const factory = amountFactory(blockchainIdToCode(blockchain));

        const { [address]: entries = [] } = entriesByAddress;

        const details = entries
          .filter((entry) => entry.blockchain === blockchain)
          .map<AccountDetails>(({ id }) => {
            return {
              address,
              balance: factory(amount).encode(),
              entryId: id,
              utxo: utxo?.map(({ txid, vout, amount: value }) => ({
                address,
                vout,
                txid,
                value: factory(value).encode(),
              })),
            };
          });

        return [...carry, ...details];
      }, []),
    ],
  };
}

function onWalletCreated(state: IAccountsState, action: IWalletCreatedAction): IAccountsState {
  const { wallet } = action;

  if (state.wallets.some((item) => item.id === action.wallet.id)) {
    return state;
  }

  return { ...state, wallets: [...state.wallets, wallet] };
}

function updateWallet(state: IAccountsState, walletId: Uuid, update: Updater<Wallet>): IAccountsState {
  const wallets = state.wallets.map((wallet) => {
    if (wallet.id === walletId) {
      return update({ ...wallet });
    } else {
      return wallet;
    }
  });

  return { ...state, wallets };
}

function onHdAccountCreated(state: IAccountsState, action: IHdAccountCreated): IAccountsState {
  const { walletId, account } = action.payload;

  return updateWallet(state, walletId, (wallet) => ({ ...wallet, entries: [...wallet.entries, account] }));
}

function onLoading(state: IAccountsState, action: ISetLoadingAction): IAccountsState {
  return {
    ...state,
    loading: action.payload,
  };
}

function updateAccountDetails(
  state: IAccountsState,
  address: string,
  entryId: EntryId,
  update: Updater<AccountDetails>,
): IAccountsState {
  return produce(state, (draft) => {
    const index = state.details.findIndex((detail) => detail.address === address);

    if (index === -1) {
      draft.details.push(update({ address, entryId }));
    } else {
      draft.details[index] = update(draft.details[index]);
    }
  });
}

function onSetBalance(state: IAccountsState, action: ISetBalanceAction): IAccountsState {
  const { address, balance, entryId, utxo } = action.payload;

  return updateAccountDetails(state, address, entryId, (account) => ({ ...account, balance, utxo }));
}

function onWalletsLoaded(state: IAccountsState, action: IWalletsLoaded): IAccountsState {
  return {
    ...state,
    wallets: action.payload,
  };
}

function onSetSeeds(state: IAccountsState, action: ISetSeedsAction): IAccountsState {
  return {
    ...state,
    seeds: action.payload,
  };
}

function onSetTxCount(state: IAccountsState, action: ISetTxCountAction): IAccountsState {
  return updateAccountDetails(state, action.address, action.entryId, (account) => {
    return { ...account, txcount: action.value };
  });
}

function onSetWalletIcons(state: IAccountsState, { icons }: SetWalletIconsAction): IAccountsState {
  return { ...state, icons };
}

function onWalletUpdated(state: IAccountsState, action: IUpdateWalletAction): IAccountsState {
  const { walletId, name } = action.payload;

  return updateWallet(state, walletId, (wallet) => ({ ...wallet, name }));
}

export function reducer(state: IAccountsState = INITIAL_STATE, action: AccountsAction): IAccountsState {
  switch (action.type) {
    case ActionTypes.INIT_STATE:
      return onInitState(state, action);
    case ActionTypes.CREATE_WALLET_SUCCESS:
      return onWalletCreated(state, action);
    case ActionTypes.HD_ACCOUNT_CREATED:
      return onHdAccountCreated(state, action);
    case ActionTypes.LOADING:
      return onLoading(state, action);
    case ActionTypes.SET_BALANCE:
      return onSetBalance(state, action);
    case ActionTypes.SET_LIST:
      return onWalletsLoaded(state, action);
    case ActionTypes.SET_SEEDS:
      return onSetSeeds(state, action);
    case ActionTypes.SET_TXCOUNT:
      return onSetTxCount(state, action);
    case ActionTypes.SET_WALLET_ICONS:
      return onSetWalletIcons(state, action);
    case ActionTypes.WALLET_UPDATED:
      return onWalletUpdated(state, action);
    default:
      return state;
  }
}
