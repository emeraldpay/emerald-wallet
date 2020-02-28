import { Wei } from '@emeraldplatform/eth';
import {blockchainByName, BlockchainCode, blockchainById, blockchainCodeToId} from '@emeraldwallet/core';
import {
  ActionTypes,
  AddWalletAction,
  AddressesAction,
  IAddressesState,
  SetBalanceAction,
  SetListAction,
  SetLoadingAction,
  SetTxCountAction,
  IUpdateAddressAction, AccountDetails
} from './types';
import * as vault from '@emeraldpay/emerald-vault-core';
import { WalletsOp } from '@emeraldpay/emerald-vault-core';

export const INITIAL_STATE: IAddressesState = {
  wallets: [],
  loading: true,
  details: []
};

function onLoading (state: any, action: SetLoadingAction): IAddressesState {
  return Object.assign({}, state, {loading: action.payload})
}

function findExistingAccount(wallets: vault.Wallet[], accountId: vault.AccountId): vault.WalletAccount | undefined {
  return vault.WalletsOp.of(wallets).findAccount(accountId);
}

function onSetList (state: IAddressesState, action: SetListAction): IAddressesState {
  const wallets: vault.Wallet[] = action.payload;

  return Object.assign({}, state, {wallets});
}

type Updater<T> = (source: T) => T;

function updateWallet(state: IAddressesState, walletId: vault.Uuid, f: Updater<vault.Wallet>): IAddressesState {
  let wallets = state.wallets.map((wallet) => {
    if (wallet.id === walletId) {
      return f(Object.assign({}, wallet));
    } else {
      return wallet;
    }
  });
  return Object.assign({}, state, {wallets});
}

function updateAccountDetails (state: IAddressesState, accountId: vault.AccountId, f: Updater<AccountDetails>): IAddressesState {
  let account = WalletsOp.of(state.wallets)
    .findAccount(accountId);
  if (typeof account === 'undefined') {
    console.warn("Unknown account", accountId);
    return state;
  }
  let blockchain = blockchainById(account.blockchain)!.params.code;
  let filter = (details: AccountDetails) => details.accountId == accountId;
  let current = state.details.find(filter);
  if (typeof current == "undefined") {
    current = {
      accountId
    };
  }
  current = f(current) || current;

  let details = state.details.filter((d) => !filter(d));
  details.push(current);

  return Object.assign({}, state, {details});
}

function onSetBalance (state: IAddressesState, action: SetBalanceAction): IAddressesState {
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
        return account
      })
    });
  return updatedState;
}

function onUpdateWallet (state: any, action: IUpdateAddressAction) {
  const { walletId, name, description } = action.payload;
  return updateWallet(state, walletId, (wallet) => {
    wallet.name = name;
    wallet.description = description;
    return wallet
  });
}

function onAddAccount (state: IAddressesState, action: AddWalletAction): IAddressesState {
  const { wallet } = action;
  if (state.wallets.some((w) => w.id === action.wallet.id)) {
    // already exists
    return state
  }
  const addition: vault.Wallet = {
    id: wallet.id,
    name: wallet.name,
    description: "",
    accounts: wallet.accounts
  };
  const wallets = state.wallets.concat([addition]);
  return Object.assign({}, state, {wallets})
}

function onSetTxCount (state: any, action: SetTxCountAction) {
  return updateAccountDetails(state, action.accountId, (acc) => {
    acc.txcount = action.value;
    return acc
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
  state: IAddressesState = INITIAL_STATE,
  action: AddressesAction
): IAddressesState {
  switch (action.type) {
    case ActionTypes.UPDATE_ACCOUNT:
      return onUpdateWallet(state, action);
    case ActionTypes.SET_BALANCE:
      return onSetBalance(state, action);
    case ActionTypes.LOADING:
      return onLoading(state, action);
    case ActionTypes.SET_LIST:
      return onSetList(state, action);
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
