import * as vault from '@emeraldpay/emerald-vault-core';
import { WalletsOp } from '@emeraldpay/emerald-vault-core';
import { blockchainCodeToId } from '@emeraldwallet/core';
import produce from 'immer';
import {
  AccountDetails,
  ActionTypes,
  AddressesAction,
  IAccountsState,
  IAddWalletAction,
  ISetBalanceAction,
  ISetLoadingAction,
  IUpdateAddressAction,
  IWalletsLoaded, SetTxCountAction
} from './types';

export const INITIAL_STATE: IAccountsState = {
  wallets: [],
  loading: true,
  details: []
};

function onLoading (state: IAccountsState, action: ISetLoadingAction): IAccountsState {
  return { ...state, loading: action.payload };
}

function findExistingAccount (wallets: vault.Wallet[], accountId: vault.AccountId): vault.WalletAccount | undefined {
  return vault.WalletsOp.of(wallets).findAccount(accountId);
}

function onLoaded (state: IAccountsState, action: IWalletsLoaded): IAccountsState {
  const wallets: vault.Wallet[] = action.payload;
  return { ...state, wallets };
}

type Updater<T> = (source: T) => T;

function updateWallet (state: IAccountsState, walletId: vault.Uuid, f: Updater<vault.Wallet>): IAccountsState {
  const wallets = state.wallets.map((wallet) => {
    if (wallet.id === walletId) {
      return f({ ...wallet });
    } else {
      return wallet;
    }
  });
  return { ...state, wallets };
}

function updateAccountDetails (
  state: IAccountsState, accountId: vault.AccountId, f: Updater<AccountDetails>
): IAccountsState {
  const account = WalletsOp.of(state.wallets).findAccount(accountId);

  if (typeof account === 'undefined') {
    console.warn('Unknown account', accountId);
    return state;
  }

  return produce(state, (draft) => {
    let found = false;
    for (let i = 0; i < state.details.length; i++) {
      const current = draft.details[i];
      if (current.accountId === accountId) {
        found = true;
        draft.details[i] = f(current);
        break;
      }
    }
    if (!found) {
      const newAccountDetails = f({ accountId });
      draft.details.push(newAccountDetails);
    }
  });
}

function onSetBalance (state: IAccountsState, action: ISetBalanceAction): IAccountsState {
  const { address, blockchain, value } = action.payload;
  const blockchainId = blockchainCodeToId(blockchain);

  let updatedState = state;
  WalletsOp.of(state.wallets)
    .getAccounts()
    .filter((account) => account.address === address && account.blockchain === blockchainId)
    .forEach((account) => {
      updatedState = updateAccountDetails(updatedState, account.id, (account) => {
        account.balance = value;
        account.balancePending = null;
        return account;
      });
    });
  return updatedState;
}

function onUpdateWallet (state: any, action: IUpdateAddressAction) {
  const { walletId, name, description } = action.payload;
  return updateWallet(state, walletId, (wallet) => {
    wallet.name = name;
    wallet.description = description;
    return wallet;
  });
}

function onAddAccount (state: IAccountsState, action: IAddWalletAction): IAccountsState {
  const { wallet } = action;
  if (state.wallets.some((w) => w.id === action.wallet.id)) {
    // already exists
    return state;
  }
  const addition: vault.Wallet = {
    id: wallet.id,
    name: wallet.name,
    description: '',
    accounts: wallet.accounts
  };
  const wallets = state.wallets.concat([addition]);
  return { ...state, wallets };
}

function onSetTxCount (state: any, action: SetTxCountAction) {
  return updateAccountDetails(state, action.accountId, (acc) => {
    acc.txcount = action.value;
    return acc;
  });
}
//
// function onPendingBalance (state: any, action: PendingBalanceAction) {
//   if (action.type === ActionTypes.PENDING_BALANCE) {
//     const blockchain = blockchainByName(action.blockchain).params.code;
//     let bal;
//     if (action.to) {
//       return updateAccountDetails(state, action.to, blockchain,(acc: any) => {
//         bal = acc.get('balance').plus(new Wei(action.value));
//         return acc.set('balancePending', bal);
//       });
//     }
//     if (action.from) {
//       return updateAccountDetails(state, action.from, blockchain,(acc: any) => {
//         bal = acc.get('balance').sub(new Wei(action.value));
//         return acc.set('balancePending', bal);
//       });
//     }
//   }
//   return state;
// }

export function reducer (
  state: IAccountsState = INITIAL_STATE,
  action: AddressesAction
): IAccountsState {
  switch (action.type) {
    case ActionTypes.UPDATE_ACCOUNT:
      return onUpdateWallet(state, action);
    case ActionTypes.SET_BALANCE:
      return onSetBalance(state, action);
    case ActionTypes.LOADING:
      return onLoading(state, action);
    case ActionTypes.SET_LIST:
      return onLoaded(state, action);
    case ActionTypes.ADD_WALLET:
      return onAddAccount(state, action);
    case ActionTypes.SET_TXCOUNT:
      return onSetTxCount(state, action);
    // case ActionTypes.PENDING_BALANCE:
    //   return onPendingBalance(state, action);
    default:
      return state;
  }
}
