import { EntryId, Uuid, Wallet } from '@emeraldpay/emerald-vault-core';
import { amountFactory, blockchainIdToCode } from '@emeraldwallet/core';
import produce from 'immer';
import {
  AccountDetails,
  AccountsAction,
  AccountsState,
  ActionTypes,
  HdAccountCreatedAction,
  InitAccountStateAction,
  SetBalanceAction,
  SetLoadingAction,
  SetSeedsAction,
  SetTxCountAction,
  SetWalletIconsAction,
  UpdateWalletAction,
  WalletCreatedAction,
  WalletsLoadedAction,
} from './types';

type Updater<T> = (source: T) => T;

export const INITIAL_STATE: AccountsState = {
  details: [],
  icons: {},
  loading: true,
  seeds: [],
  wallets: [],
};

function onInitState(state: AccountsState, { balances, entriesByAddress }: InitAccountStateAction): AccountsState {
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

function onWalletCreated(state: AccountsState, action: WalletCreatedAction): AccountsState {
  const { wallet } = action;

  if (state.wallets.some((item) => item.id === action.wallet.id)) {
    return state;
  }

  return { ...state, wallets: [...state.wallets, wallet] };
}

function updateWallet(state: AccountsState, walletId: Uuid, update: Updater<Wallet>): AccountsState {
  const wallets = state.wallets.map((wallet) => {
    if (wallet.id === walletId) {
      return update({ ...wallet });
    } else {
      return wallet;
    }
  });

  return { ...state, wallets };
}

function onHdAccountCreated(state: AccountsState, action: HdAccountCreatedAction): AccountsState {
  const { walletId, account } = action.payload;

  return updateWallet(state, walletId, (wallet) => ({ ...wallet, entries: [...wallet.entries, account] }));
}

function onLoading(state: AccountsState, action: SetLoadingAction): AccountsState {
  return {
    ...state,
    loading: action.payload,
  };
}

function updateAccountDetails(
  state: AccountsState,
  address: string,
  entryId: EntryId,
  update: Updater<AccountDetails>,
): AccountsState {
  return produce(state, (draft) => {
    const index = state.details.findIndex((detail) => detail.address === address && detail.entryId === entryId);

    if (index === -1) {
      draft.details.push(update({ address, entryId }));
    } else {
      draft.details[index] = update(draft.details[index]);
    }
  });
}

function onSetBalance(state: AccountsState, action: SetBalanceAction): AccountsState {
  const { address, balance, entryId, utxo } = action.payload;

  return updateAccountDetails(state, address, entryId, (account) => ({ ...account, balance, utxo }));
}

function onWalletsLoaded(state: AccountsState, action: WalletsLoadedAction): AccountsState {
  return {
    ...state,
    wallets: action.payload,
  };
}

function onSetSeeds(state: AccountsState, action: SetSeedsAction): AccountsState {
  return {
    ...state,
    seeds: action.payload,
  };
}

function onSetTxCount(state: AccountsState, action: SetTxCountAction): AccountsState {
  return updateAccountDetails(state, action.address, action.entryId, (account) => {
    return { ...account, txcount: action.value };
  });
}

function onSetWalletIcons(state: AccountsState, { icons }: SetWalletIconsAction): AccountsState {
  return { ...state, icons };
}

function onWalletUpdated(state: AccountsState, action: UpdateWalletAction): AccountsState {
  const { walletId, name } = action.payload;

  return updateWallet(state, walletId, (wallet) => ({ ...wallet, name }));
}

export function reducer(state: AccountsState = INITIAL_STATE, action: AccountsAction): AccountsState {
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
